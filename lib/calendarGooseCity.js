'use strict';

/**
 * 程序员老黄历命令行版
 *
 * 本程序灵感来源于 http://sandbox.runjs.cn/show/ydp3it7b
 * 部分代码也来自该项目
 *
 * 佛祖图案来源于 https://github.com/ottomao/bugfreejs
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const path = require('path');

// 尝试载入最新的数据
const defineNewestFile = path.resolve(process.env.HOME, '.programmer-calendar.define_goose_city.json');
try {
  var defineNewest = require(defineNewestFile);
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    console.error(err);
  }
  var defineNewest = require('./define_goose_city');
}

Date.prototype.addDays = function (days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

const define = defineNewest;
const today = (new Date()).addDays(1);
const iday = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();


/*
 * 注意：本程序中的“随机”都是伪随机概念，以当前的天为种子。
 */
function random(dayseed, indexseed) {
  var n = dayseed % 11117;
  for (var i = 0; i < 100 + indexseed; i++) {
    n = n * n;
    n = n % 11117; // 11117 是个质数
  }
  return n;
}

function is_someday() {
  return today.getMonth() == 5 && today.getDate() == 4;
}

function getTodayString() {
  return "今天是" + today.getFullYear() + "年" + (today.getMonth() + 1) + "月" + today.getDate() + "日 星期" + define.weeks[today.getDay()];
}

function star(num) {
  var result = [];
  var i = 0;
  while (i < num) {
    result.push('★');
    i++;
  }
  while (i < 5) {
    result.push('☆');
    i++;
  }
  return result.join(' ');
}

// 生成今日运势
function pickTodaysLuck() {
  let _activities = filter(define.activities);

  let numGood = random(iday, 98) % 3 + 2;
  let numBad = random(iday, 87) % 3 + 2;
  let eventArr = pickRandomActivity(_activities, numGood + numBad);

  let special = pickSpecials();

  let goodList = special.good;
  let badList = special.bad;

  for (let i = 0; i < numGood; i++) {
    goodList.push(eventArr[i]);
  }

  for (let i = 0; i < numBad; i++) {
    badList.push(eventArr[numGood + i]);
  }

  return {good: goodList.slice(0, 4), bad: badList.slice(0, 4)};
}

// 去掉一些不合今日的事件
function filter(activities) {
  let result = [];

  // 周末的话，只留下 weekend = true 的事件
  if (isWeekend()) {

    for (let i = 0; i < activities.length; i++) {
      if (activities[i].weekend) {
        result.push(activities[i]);
      }
    }

    return result;
  }

  return activities;
}

function isWeekend() {
  return today.getDay() == 0 || today.getDay() == 6;
}

// 添加预定义事件
function pickSpecials() {

  let goodList = [];
  let badList = [];

  for (let i = 0; i < define.specials.length; i++) {
    let special = define.specials[i];

    if (iday == special.date) {
      if (special.type == 'good') {
        goodList.push({
          name: special.name,
          good: special.description
        });
      } else {
        badList.push({
          name: special.name,
          bad: special.description
        });
      }
    }
  }

  return {good: goodList, bad: badList};
}

// 从 activities 中随机挑选 size 个
function pickRandomActivity(activities, size) {
  let picked_events = pickRandom(activities, size);

  for (let i = 0; i < picked_events.length; i++) {
    picked_events[i] = parse(picked_events[i]);
  }

  return picked_events;
}

// 从数组中随机挑选 size 个
function pickRandom(array, size) {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    result.push(array[i]);
  }

  for (let j = 0; j < array.length - size; j++) {
    let index = random(iday, j) % result.length;
    result.splice(index, 1);
  }

  return result;
}

// 解析占位符并替换成随机内容
function parse(event) {
  let result = {
    name: event.name,
    good: event.good,
    bad: event.bad
  }; // clone

  if (result.name.indexOf('%v') != -1) {
    result.name = result.name.replace('%v', define.varNames[random(iday, 12) % define.varNames.length]);
  }

  if (result.name.indexOf('%t') != -1) {
    result.name = result.name.replace('%t', define.tools[random(iday, 11) % define.tools.length]);
  }

  if (result.name.indexOf('%l') != -1) {
    result.name = result.name.replace('%l', (random(iday, 12) % 247 + 30).toString());
  }

  return result;
}

// 获得座位朝向
function getDirectionString() {
  return define.directions[random(iday, 2) % define.directions.length];
}

// 获得今日宜饮
function getDrinkString() {
  return pickRandom(define.drinks, 2).join('，');
}

// 获得女神亲近指数
function getStarString() {
  return star(Math.ceil(Math.random()*10 /2));
}

// 获得男神亲近指数
function getSecondStarString() {
  return star(Math.ceil(Math.random()*10 /2));
}


exports.getTodayString = getTodayString;
exports.getDirectionString = getDirectionString;
exports.getDrinkString = getDrinkString;
exports.getStarString = getStarString;
exports.getSecondStarString = getSecondStarString;
exports.pickTodaysLuck = pickTodaysLuck;
