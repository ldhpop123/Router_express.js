// express 모듈
const express = require('express');
// morgan 미들웨어 -> HTTP 요청 로그 기록
const morgan = require('morgan');
// cookie-parser 미들웨어 -> 쿠키를 파싱
const cookieParser = require('cookie-parser');
// express-session 미들웨어 -> 세션을 구현
const session = require('express-session');
// dotenv 라이브러리 -> 환경 변수 관리
const dotenv = require('dotenv');
// path 모듈 -> 파일 경로 관리
const path = require('path');
// nunjucks 모듈 -> Nunjucks 템플릿 엔진 사용
const nunjucks = require('nunjucks');

dotenv.config(); // dotenv 설정파일 불러오기

// 라우터 모듈 불러오기
const indexRouter = require('./routes')
const userRouter = require('./routes/user')

// express 애플리케이션 생성
const app = express();
// 포트 설정
app.set('port',process.env.PORT || 3000);
    // 환경 변수에 PORT가 설정되어 있지 않으면 3000번 포트를 사용
app.set('view engine', 'html');
    // Express 애플리케이션에서 사용할 뷰 엔진을 설정

// Nunjucks 템플릿 엔진을 설정
nunjucks.configure('views', {
    // 'view' -> 템플릿 파일이 위치한 디렉토리 경로 지정
    express: app,
    // nunjucks가 express의 템플릿 엔지으로 사용될 때, Express 애플리케이션과 연동될 수 있도록 설정
    wach: true,
    // 템플릿 파일의 변경 -> Nunjucks 자동 업데이트 수행
    // 템플릿 파일이 변경되면 변경사항을 서버 재시작 없이 반영
});

// morgan 미들웨어 -> 개발 환경에서 요청 로그 출력
app.use(morgan('dev'));
// express.static 미들웨어 -> 정적 파일 제공
app.use('/', express.static(path.join(__dirname, 'public')));
// express.json 미들웨어 -> JSON 형식의 요청 본문 파싱
app.use(express.json());
// express.urlencoded 미들웨어 -> URL-encoded 형식의 요청 본문 파싱
app.use(express.urlencoded({extends: false}));
// cookie-parser 미들웨어 -> 쿠키를 파싱
app.use(cookieParser(process.env.COOKIE_SECRET));

// 세션을 등록하기 위한 미들웨어 등록
app.use(session({
    resave: false,
    // 변경 사항이 없을 경우에도 세션을 다시 저장하지 않음.
    saveUninitialized: false,
    // 초기화되지 않은 세션을 다시 저장되지 않음.
    secret: process.env.COOKIE_SECRET,
    // 세션을 암호화하기 위한 시크릿 키
    cookie: {
        httpOnly: true,
        // 클라이언트에서 쿠키를 수정할 수 없도록 설정
        secure: false,
        // HTTP가 아닌 환경에서도 쿠키를 사용할 수 있도록 설정
    },
    naem: 'session-cookie',
    // 세션에 쿠키의 이름 지정
}));
// '/' 경로에 대한 라우터 등록
app.use('/', indexRouter);
// '/user' 경로에 대한 라우터 등록
app.use('/user', userRouter);

// 위에서 등록된 라우터에 일치하는 경로가 없는 경우 -> 404 에러 처리
app.use((req, res, next) => {
    res.status(404).send('NOT Found');
});

// 에러 핸들링 미들웨어 -> 에러가 발생한 경우 500 애러 응답
app.use((err, req, res, next) => {
    console.error(err);
    // 에러 로그 출력
    res.status(500).send(err.message);
    // 에러 메시지를 응답으로 전송
});

// 지정된 포트애서 서버 대기
app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기중');
    // 서버가 대기중임을 콘솔에 출력
});