// bhseo1223 nodejs : routes - member_searchpw : rkmarket_app

var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var mysqlConfig = require('../../config/mysql_config.json');
var connection = mysql.createConnection({
        host: mysqlConfig.host, 
        user: mysqlConfig.user,
        password: mysqlConfig.password,
        database: mysqlConfig.database
    });
connection.connect();
var moment = require('moment');


router.get('/member/member_searchpw', function(req, res) {  // url(get) : '/member/member_searchpw'
    
    // get
    var searchProcess  = req.query.searchprocess;  // 인증프로세스
    var memberId       = req.query.memberid;       // 아이디(회원)
    var mobileNumber   = req.query.mobilenumber;   // 휴대전화번호
    var authNumber     = req.query.authnumber;     // 인증번호
    // get

    // 공용
    var today   = moment().format('YYYY-MM-DD');           // 일자
    var todate  = moment().format('YYYY-MM-DD HH:mm:ss');  // 일시
    var iddate  = moment().format('YYYYMMDDHHmmssSSSS');   // 일련번호
    // 공용

    // 주의문구
    var resultCheck  = 'N';  // 비밀번호 찾기 결과 _ 초기화

    if (searchProcess == undefined) {
        searchProcess  = 0;
    };

    if (searchProcess == 0) { // 휴대전화번호 미입력, 인증번호 미입력

        var mobilenumberCaution  = '아이디와 휴대전화번호 입력후 전송받기를 눌러 주세요.';
        var authnumberCaution    = '인증번호를 전송 받은후 진행해 주세요.';
        var resultText1          = '휴대전화 인증정보 입력중입니다.';
        var resultText2          = '반드시 등록된 번호를 입력해 주세요.';

    } else if (searchProcess == 1) { // 휴대전화번호 입력, 인증번호 미입력

        var mobilenumberCaution  = '인증하기를 진행해 주세요.';
        var authnumberCaution    = '전송받은 인증번호 입력후 인증하기를 눌러 주세요.';
        var resultText1          = '휴대전화 인증정보 입력중입니다.';
        var resultText2          = '인증번호를 발송하였습니다.';

        // SELECT : member - 회원정보
        var sqlMember = `SELECT password FROM member WHERE id = ? AND mobilenumber = ?`;
        var paramsMember = [memberId, mobileNumber];
        connection.query(sqlMember, paramsMember, function(err, rowsMember, fields) {

            // 아이디와 휴대전화번호 확인
            if (rowsMember.length > 0) {

                // SELECT : member_searchpw - 비밀번호찾기_인증
                var sqlMembersearchpw = `SELECT MAX(senddate) AS maxsenddate FROM member_searchpw WHERE member_id = ? AND mobilenumber = ?`;
                var paramsMembersearchpw = [memberId, mobileNumber];
                connection.query(sqlMembersearchpw, paramsMembersearchpw, function(err, rowsMembersearchpw, fields) {

                    // 시간내 인증번호 전송 제한 : 60초
                    if (rowsMembersearchpw[0].maxsenddate == null) {
                        var checkDate = '';
                    } else {
                        var checkDate = moment(rowsMembersearchpw[0].maxsenddate).add('60', 's').format('YYYY-MM-DD HH:mm:ss');
                    };

                    if (checkDate < todate) {

                        // INSERT member_searchpw - data
                        var authNumberSMS = Math.floor(Math.random() * (111111 - 999999)) + 999999;

                        var membersearchpwId            = `SP${iddate}${mobileNumber}`;  // member_searchpw: id - 일련번호
                        var membersearchpwMemberid      = memberId;                      // member_searchpw: member_id - 아이디(회원)
                        var membersearchpwMobilenumber  = mobileNumber;                  // member_searchpw: mobilenumber - 휴대전화번호
                        var membersearchpwAuthnumber    = authNumberSMS;                 // member_searchpw: authnumber - 인증번호
                        var membersearchpwSenddate      = todate;                        // member_searchpw: senddate - 전송일시
                        var membersearchpwCheckauth     = 'N';                           // member_searchpw: check_auth - 확인_인증
                        var membersearchpwAuthdate      = '';                            // member_searchpw: authdate - 인증일시
                        // INSERT member_searchpw - data

                        // INSERT member_searchpw
                        var sqlMembersearchidINSERT = `INSERT INTO member_searchpw
                                    (id, member_id, mobilenumber, authnumber, senddate, check_auth, authdate)
                                VALUES (?, ?, ?, ?, ?, ?, ?)`;
                        var paramsMembersearchidINSERT = [
                                membersearchpwId, membersearchpwMemberid, membersearchpwMobilenumber, membersearchpwAuthnumber, 
                                membersearchpwSenddate, membersearchpwCheckauth, membersearchpwAuthdate];
                        connection.query(sqlMembersearchidINSERT, paramsMembersearchidINSERT, function(err, rowsMembersearchidUPDATE, fields) {

                            // SMS
                            
                        });
                        // INSERT member_searchpw
                        
                    } else {

                        resultText1  = '시간제한!  처음부터 다시 진행해 주세요.';
                        resultText2  = '인증번호는 1분에 1번만 발송합니다.';

                    };
                    // 시간내 인증번호 전송 제한 : 60초

                });
                // SELECT : member_searchpw - 비밀번호찾기_인증

            } else {

                resultText1  = '계정없음!  처음부터 다시 진행해 주세요.';
                resultText2  = '아이디와 휴대전화번호를 확인해 주세요.';

            };
            // 아이디와 휴대전화번호 확인

        });
        // SELECT : member - 회원정보

    } else if (searchProcess == 2) { // 휴대전화번호 입력, 인증번호 입력

        var mobilenumberCaution  = '인증하기를 진행해 주세요.';
        var authnumberCaution    = '인증이 완료되면 인증 결과가 표시됩니다..';
        // var resultText1          = '휴대전화 인증중이니 잠시만 기다려 주세요.';
        // var resultText2          = '새로고침이나 뒤로가기를 누르지 마세요.';

        // SELECT : member_searchpw - 비밀번호찾기_인증
        var sqlMembersearchpw = `SELECT * FROM member_searchpw WHERE senddate = (SELECT MAX(senddate) FROM member_searchpw WHERE member_id = ? AND mobilenumber = ? AND authnumber = ?)`;
        var paramsMembersearchpw = [memberId, mobileNumber, authNumber];
        connection.query(sqlMembersearchpw, paramsMembersearchpw, function(err, rowsMembersearchpw, fields) {

            // 인증번호 확인
            if (rowsMembersearchpw.length > 0) {

                // 사용처리 확인
                if (rowsMembersearchpw[0].check_auth == 'N') { // 미사용시

                    // 시간내 인증번호 입력 : 180초
                    var checkDate = moment(rowsMembersearchpw[0].senddate).add('180', 's').format('YYYY-MM-DD HH:mm:ss');

                    if (checkDate >= todate) {

                        // UPDATE : member_searchpw - 사용처리
                        var sqlMembersearchpwUPDATE = `UPDATE member_searchpw SET check_auth = 'Y', authdate = ? WHERE id = ?`;
                        var paramsMembersearchpwUPDATE = [todate, rowsMembersearchpw[0].id];
                        connection.query(sqlMembersearchpwUPDATE, paramsMembersearchpwUPDATE, function(err, rowsMembersearchpwUPDATE, fields) {});
                        // UPDATE : member_searchpw - 사용처리

                        // SELECT : member - 회원정보
                        var sqlMember = `SELECT password FROM member WHERE id = ? AND mobilenumber = ?`;
                        var paramsMember = [memberId, mobileNumber];
                        connection.query(sqlMember, paramsMember, function(err, rowsMember, fields) {

                            // 아이디와 휴대전화번호 확인
                            if (rowsMember.length > 0) {

                                resultText1  = '비밀번호 전송완료! 새로고침 하지 마세요.';
                                resultText2  = '휴대전화번호로 전송하였습니다.'; 
                                resultCheck  = 'Y';

                                // SMS 처리
                                    // 비밀번호 SMS로 보내기
                                // SMS 처리

                            } else {

                                resultText1  = '계정없음!  처음부터 다시 진행해 주세요.';
                                resultText2  = '아이디와 휴대전화번호를 확인해 주세요.';

                            };
                            // 아이디와 휴대전화번호 확인

                        });
                        // SELECT : member - 회원정보

                    } else {

                        resultText1  = '시간초과!  처음부터 다시 진행해 주세요.';
                        resultText2  = '인증번호 입력시간(3분)이 초과하였습니다.';

                    };
                    // 시간내 인증번호 입력 : 180초

                } else { // 사용시
                    
                    resultText1  = '중복인증!  처음부터 다시 진행해 주세요.';
                    resultText2  = '인증에 사용된 인증번호입니다.';

                };
                // 사용처리 확인

            } else {

                resultText1  = '인증오류!  처음부터 다시 진행해 주세요.';
                resultText2  = '전송 인증번호와 입력 인증번호가 다릅니다.';
                
            };
            // 인증번호 확인

        });
        // SELECT : member_searchpw - 아이디찾기_인증

    };
    // 주의 문구

    // sync
    connection.query(`SELECT * FROM sync`, function(err, rows, fields) {
        // sync
        connection.query(`SELECT * FROM sync`, function(err, rows, fields) {

            // render
            res.render('member/member_searchpw', {
                // 타이틀
                title:                '아이디찾기',
                // 타이틀
                // 데이터
                searchprocess:        searchProcess,        // 인증프로세스
                memberid:             memberId,             // 아이디(회원)
                mobilenumber:         mobileNumber,         // 휴대전화번호
                authnumber:           authNumber,           // 인증번호
                mobilenumbercaution:  mobilenumberCaution,  // 주의문구_휴대전화번호
                authnumbercaution:    authnumberCaution,    // 주의문구_인증번호
                resultcheck:          resultCheck,          // 결과문구_구분
                resulttext1:          resultText1,          // 결과문구1
                resulttext2:          resultText2           // 결과문구2
                // 데이터
            });
            // render

        });
        // sync
    });
    // sync

});


module.exports = router;


// bhseo1223 nodejs : routes - member_searchpw : rkmarket_app