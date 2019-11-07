function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

function sleep(ms) {
  return new Promise(reslove => {
    setTimeout(reslove, ms);
  });
}

// 传入一些默认参数
async function requestCloud(funcName, data, app, needLogin) {
  let userId = "";
  if (app) {
    userId = await app.getUserId();

    if (!userId && needLogin) {
      wx.showToast({
        title: "没有登录",
        icon: "none"
      });
      return;
    }
  }

  return wx.cloud.callFunction({
    name: "duoduo",
    data: {
      name: funcName,
      ...data,
      userId
    }
  });
}

function getJibansComputed(raceList, careerList, heroList) {
  if (!raceList.length || !careerList.length || !heroList.length) return [];
  const RACE_LIST_ECP_GOD_AND_DEMO = raceList.filter(
    el => el.name !== "神族" || "恶魔"
  );
  const raceJibanObj = {};
  const careerJibanObj = {};
  const jibanList = [];
  let demoCount, godCount, dhCount, godBuffLocked;

  raceList.forEach(race => {
    const sameRaceChesses = heroList.filter(hero =>
      hero.category.includes(race.name)
    );

    const sameRaceCount = sameRaceChesses.length;

    raceJibanObj[race.name] = {
      sameRaceCount,
      heroList: sameRaceChesses,
      isLocked: false
    };
  });

  demoCount = raceJibanObj["恶魔"].sameRaceCount;
  godCount = raceJibanObj["神族"].sameRaceCount;

  careerList.forEach(career => {
    const sameCareerChesses = heroList.filter(el =>
      el.cardType.includes(career.name)
    );
    const sameCareerCount = sameCareerChesses.length;
    careerJibanObj[career.name] = {
      sameCareerCount,
      heroList: sameCareerChesses,
      isLocked: false
    };
  });

  dhCount = careerJibanObj["恶魔猎手"].sameCareerCount;

  for (const name in raceJibanObj) {
    const { skills: raceSkills, ethnicPattern: icon } = raceList.find(
      el => el.name === name
    );
    if (raceJibanObj[name].sameRaceCount > 0) {
      const _raceSkills = raceSkills.filter(
        el => el[0] <= raceJibanObj[name].sameRaceCount
      );
      if (_raceSkills.length) {
        jibanList.push({
          name,
          list: _raceSkills,
          length: raceSkills.length,
          icon,
          heroList: raceJibanObj[name].heroList
        });
      }
    }
  }

  for (const name in careerJibanObj) {
    const { skills: careerSkills, careerImg: icon } = careerList.find(
      el => el.name === name
    );

    if (careerJibanObj[name].sameCareerCount > 0) {
      const _careerSkills = careerSkills.filter(
        el => el[0] <= careerJibanObj[name].sameCareerCount
      );

      if (_careerSkills.length) {
        jibanList.push({
          name,
          list: _careerSkills,
          length: careerSkills.length,
          icon,
          heroList: careerJibanObj[name].heroList
        });
      }
    }
  }

  if (demoCount > 1 && dhCount < 2) {
    jibanList.find(item => item.name === "恶魔").buffLocked = true;
  }

  if (jibanList.some(item => RACE_LIST_ECP_GOD_AND_DEMO.includes(item.name))) {
    godBuffLocked = true;
  }

  // 多恶魔无DH羁绊，神族buff有效
  if (godCount && !godBuffLocked && demoCount > 1 && dhCount < 2) {
    godBuffLocked = false;
  }

  // 多恶魔有DH羁绊， 神族buff无效
  if (godCount && demoCount > 1 && dhCount > 1) {
    godBuffLocked = true;
  }

  if (godBuffLocked && godCount) {
    jibanList.find(item => item.name === "神族").buffLocked = true;
  }

  return jibanList;
}

module.exports = {
  swap: swap,
  sleep: sleep,
  requestCloud: requestCloud,
  getJibansComputed: getJibansComputed
};
