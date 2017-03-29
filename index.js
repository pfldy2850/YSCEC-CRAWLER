const fs = require('fs');
const path = require('path');

const crawl = require('./crawl.js');
const make_secret = require('./make_secret.js');


async function main() {
  const info = await make_secret.check();

  if (!info) {      
    // make user info
    console.log('유저 정보를 입력해주세요.');
    await make_secret.input('id');
    await make_secret.input('password');
    await make_secret.end();

    console.log('-------------------------------------------------------');
    await make_secret.makeSecret();
  } else {
    console.log('저장된 유저 정보 있음; secret.json');
  }

  console.log('-------------------------------------------------------');



  // crawl yscec
  const logincheck = await crawl.start(make_secret.getUserinfo());


  console.log('-------------------------------------------------------');

  if (logincheck) {

    console.log('강의 노트 크롤링 중...');
    await crawl.crawl_lecture_note_list();

    while (!crawl.lecture_note_empty()) {
      await crawl.crawl_lecture_notes();
    }


    const lectures = await crawl.get_lecture_notes();

    console.log('강의 공지 크롤링 중...');
    const notices = await crawl.crawl_notices();


    console.log('-------------------------------------------------------');
    await crawl.make_crawl_file();
    console.log('-------------------------------------------------------');

  } else {
    console.log('-------------------------------------------------------');
    console.log('저장된 유저 정보 제거.');

    await make_secret.delete();
  }

  await crawl.end();


  console.log('-------------------------------------------------------');
}

main()
  .then(() => console.log('크롤러를 종료합니다.'))
  .catch(console.log);