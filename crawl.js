const cheerio = require('cheerio');
const webdriverio = require('webdriverio');
const Iconv = require('iconv').Iconv;

const fs = require('fs');
const path = require('path');

const initURL = 'http://yscec.yonsei.ac.kr/';

var options = {
    desiredCapabilities: {
        browserName: 'chrome'
    }
};

var browser = webdriverio.remote(options);


var courseList = [];
var jsonObj = {
  'notices' : [],
  'lectures' : []
};



exports.start = function(userinfo) {
  return new Promise(function (resolve, reject) {
    browser
    .init()
    .url(initURL) // navigate to the web page

    //login process
    .setValue('#username', [userinfo['id']], function(){})
    .setValue('#password', [userinfo['password']], function(){}) 
    .submitForm('#ssoLoginForm')
    .getUrl().then(function(url) {
      if (url == 'http://yscec.yonsei.ac.kr/my/') {
        console.log('로그인 됨');
        resolve(true);
      } else {
        console.log('로그인 안됨');
        resolve(false);
      }
    });
  });
};


exports.crawl_notices = function() {
  return new Promise(function (resolve, reject) {
    browser
    .url('http://yscec.yonsei.ac.kr/local/board/index.php?type=1&courseid=1&perpage=50')
    .getHTML('html').then(function(html) {
      var iconv = new Iconv(`UTF-8`, `UTF-8//TRANSLIT//IGNORE`);
      var $ = cheerio.load(iconv.convert(html), { decodeEntities: false });

      $('ul.board-list').find('li a').each(function() {
        var tmp = {};

        tmp['href'] = $(this).attr('href');
        tmp['content'] = $(this).text().replace('&nbsp;', '');

        jsonObj['notices'].push(tmp);
      });

      resolve(jsonObj['notices']);
    });
  });
};


exports.lecture_note_empty = function() {
  if (courseList.length > 0) return false;
  else return true;
}


exports.get_lecture_notes = function() {
  return new Promise(function (resolve, reject) {
    resolve(jsonObj['lectures']);
  });
}

exports.crawl_lecture_note_list = function() {
  return new Promise(function (resolve, reject) {
    browser
    .url('http://yscec.yonsei.ac.kr')
    .getHTML('html').then(function(html) {
      var iconv = new Iconv(`UTF-8`, `UTF-8//TRANSLIT//IGNORE`);
      var $ = cheerio.load(iconv.convert(html), { decodeEntities: false });

      $('.coursebox.clearfix').each(function() {
        var tmp = {};

        tmp['course_name'] = $(this).find('h3.coursename').text();
        tmp['href'] = $(this).find('a').attr('href');

        courseList.push(tmp);
      });

      resolve('');
    });
  });
};

exports.crawl_lecture_notes = function() {
  return new Promise(function (resolve, reject) {
    var cur_course = courseList.pop();

    browser
      .url(cur_course['href'])
      .getHTML('html').then(function(html) {
        var iconv = new Iconv(`UTF-8`, `UTF-8//TRANSLIT//IGNORE`);
        var $ = cheerio.load(iconv.convert(html), { decodeEntities: false });

        var tmp = {};
        tmp['course_name'] = cur_course['course_name'];
        tmp['contents'] = [];

        $('.section.main.clearfix').each(function() {
          if ($(this).attr('id') != 'section-0') {
            $(this).find('li.activity').each(function() {
              $(this).find('a').find('span.accesshide').remove();

              var tmpObj2 = {};

              tmpObj2['href'] = $(this).find('a').attr('href');
              tmpObj2['content'] = $(this).find('a').find('span.instancename').text();

              if (tmpObj2['href'] != '#')
                tmp['contents'].push(tmpObj2);
            }); 
          }
        });

        jsonObj['lectures'].push(tmp);

        resolve('');
      });
  });
}

exports.make_crawl_file = function() {
  return new Promise(function (resolve, reject) {
    fs.writeFileSync(path.join(__dirname, `/RESULT.json`), JSON.stringify(jsonObj));

    console.log('크롤링 정보 저장 완료; RESULT.json');

    resolve('');
  });
}

exports.end = function() {
  return new Promise(function (resolve, reject) {
    browser.end();

    console.log('크롤링 완료; 브라우저를 종료합니다.');
    resolve('');

  });
}

