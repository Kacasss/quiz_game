'use strict';

window.addEventListener('DOMContentLoaded', function() {

  // 各Nodeを取得
  const start = document.getElementById('start');
  const question = document.getElementById('question');
  const answers = document.getElementById('answers');
  const gauge = document.getElementById('gauge');
  const result = document.getElementById('result');
  const restart = document.getElementById('restart');

  // レベルの切り替え
  const quizTitle1 = document.getElementById('quiz-title1');
  const quizTitle2 = document.getElementById('quiz-title2');
  const quizTitle3 = document.getElementById('quiz-title3');

  // クイズオブジェクトを格納する配列
  let quizArray;

  // もう一回やる？がクリックされた時実行
  restart.addEventListener('click', () => {
    clickedRestart();
  });

  function clickedRestart() {
    // 各配列の中身を削除
    quizArray.splice(0);

    // Quizクラスのstaticフィールドを初期化する。
    Quiz.successCount = 0;
    Quiz.missCount = 0;
    Quiz.currentNum = 0;
    Quiz.isAnswered = false;
    Quiz.isClicked = false;

    // スタート前の処理
    beforeStart();
  }

  // 初回読み込み時に呼び出し
  beforeStart();

  // スタート前の処理
  function beforeStart() {
    // 各項目を表示、非表示、初期化をする
    start.style.display = 'block';
    gauge.style.display = 'none';
    restart.style.display = 'none';
    question.textContent = '';
    result.textContent = '';
  }

  // スタートがクリックされた時の処理
  start.addEventListener('click', () => {
    clickedStart();
  });

  function clickedStart() {
    setArray();

    // 配列をシャッフルする
    Game.shuffle(quizArray);

    // スタートボタンを非表示にし、ゲージを表示する
    start.style.display = 'none';
    gauge.style.display = 'block';
    

    // クイズを表示する
    setQuiz();
  }

  // レベル1～3のクイズ内容を配列に格納する
  function setArray() {
    if ( (quizTitle2 === null && quizTitle3 === null) && quizTitle1.textContent === '都道府県クイズ1') {
      quizArray = [
        new Quiz('大阪市の県庁所在地は、何市？', ['大阪市', '堺市', '高槻市', '東大阪市']),
        new Quiz('東京都は全部で何区ある？', ['23区', '20区', '18区', '25区']),
        new Quiz('日本で一番小さな都道府県は？', ['香川県', '大阪府', '東京都', '沖縄県']),
        new Quiz('東京の次に人口の多い都市は？', ['横浜市', '大阪市', '名古屋市', '札幌市']),
      ];
    } else if ( (quizTitle1 === null && quizTitle3 === null) && quizTitle2.textContent === '都道府県クイズ2') {
      quizArray = [
        new Quiz('茨城県の県庁所在地は、何市？', ['水戸市', '宇都宮市', '前橋市', 'さいたま市']),
        new Quiz('宮崎県は、何地方？', ['九州地方', '東北地方', '中国地方', '中部地方']),
        new Quiz('北海道の県庁所在地は、何市？', ['札幌市', '旭川市', '函館市', '苫小牧市']),
        new Quiz('長野県は、何地方？', ['中部地方', '関西地方', '関東地方', '東北地方']),
      ];
    } else if ( (quizTitle1 === null && quizTitle2 === null) && quizTitle3.textContent === '都道府県クイズ3') {
      quizArray = [
        new Quiz('2022年8月時点での東京都の人口は？', ['約1400万人', '約1450万人', '約1300万人', '約1350万人']),
        new Quiz('2020年10月時点で人口150万人以上の都市は？', ['川崎市', '京都市', 'さいたま市', '広島市']),
        new Quiz('2022年8月時点での大阪府の人口は？', ['約880万人', '約900万人', '約850万人', '約860万人']),
        new Quiz('この中で三大都市圏に含まれていないのは？', ['横浜市', '東京都23区', '大阪市', '名古屋市']),
      ];
    }
  }

  // クイズを表示するメソッド
  function setQuiz() {
    // クイズの現在の数と配列の数が一致した場合、クイズを終了する
    if (Quiz.currentNum === quizArray.length) {
      endQuiz();
      return;
    }

    // クイズを表示する
    startQuiz();

    // 正解をシャッフル前のquizSet[0]で固定にする。
    // 配列を引数で渡すと参照渡しになり、元の順番も入れ替わってしまう為
    // スプレッド演算子を使い、新しい配列を作成し、それを引数で渡す。
    const shuffledAnswers = Game.shuffle([...quizArray[Quiz.currentNum].answers]);
    makeChildrenNode(shuffledAnswers);
  }

  // クイズを表示するメソッド
  function startQuiz() {
    Quiz.isClicked = false;
    question.textContent = `第${Quiz.currentNum + 1}問、${quizArray[Quiz.currentNum].question}`;
    removeChildNode(answers);
    answerGauge();
  }

  // 子要素<li>タグを全て削除するメソッド
  function removeChildNode(answers) {
      while (answers.firstChild) {
        answers.removeChild(answers.firstChild);
      }
  }

  // ゲージを表示するメソッド
  function answerGauge() {
    let i = 0;

    // ゲージが0%から始まり、40ミリ秒毎に1%ずつ増える
    let timerId = setInterval( function () {
      gauge.style.width = (0 + i) + '%';

      // 答えがクリックされたら、ゲージを止める
      if (Quiz.isClicked) {
        Quiz.isClicked = false;
        clearInterval(timerId);
        return;
      }

      // 100%に到達した場合、タイムアップとし
      // ミスカウントを増やし、次の質問へ移動する
      if (gauge.style.width === '100%') {
        Quiz.isClicked = false;
        clearInterval(timerId);
        Quiz.missCount++;
        nextQuestion();
        return;
      }
      i++;
     }, 40);
  }

  // シャッフルされたanswersを受け取り、<li>要素を作成する
  function makeChildrenNode(shuffledAnswers) {
    shuffledAnswers.forEach(answer => {
      // li要素を作成
      const li = document.createElement('li');
      // 文字を追加
      li.textContent = answer;

      // 問題レベルによって色を変更する為、classを追加する
      if ((quizTitle2 === null && quizTitle3 === null) && quizTitle1.textContent === '都道府県クイズ1') {
        li.classList.add('li-color1');
      } else if ((quizTitle1 === null && quizTitle3 === null) && quizTitle2.textContent === '都道府県クイズ2') {
        li.classList.add('li-color2');
      } else if ((quizTitle1 === null && quizTitle2 === null) && quizTitle3.textContent === '都道府県クイズ3') {
        li.classList.add('li-color3');
      }

      // answersにli要素を追加
      answers.appendChild(li);

      Quiz.isAnswered = false;
      Quiz.isClicked = false;

      li.addEventListener('click', () => {
        clickedNode(li);
      });
    });
  }

  // li要素をクリックしたら、答えを判定する
  function clickedNode(li) {
    // li要素をクリックしたら、
    // 次の問題が出るまでクリックできないようにする
    for (let i = 0; i < 4; i++) {
      answers.children[i].classList.add('not-working');
    }
    checkAnswer(li);
  }

  // クリックした内容と答えを確認するメソッド
  function checkAnswer(li) {

    // 既に答えた後の場合、処理をしない
    if (Quiz.isAnswered) {
      return;
    }

    Quiz.isAnswered = true;
    Quiz.isClicked = true;

    // クリックした内容とあらかじめ用意した答えが一致か確認
    if (li.textContent === quizArray[Quiz.currentNum].answers[0]) {
      li.classList.add('correct');
      Quiz.successCount++;
    } else {
      li.classList.add('wrong');
      Quiz.missCount++;
    }

    // 300ミリ秒後に次の質問へ移動する
    setTimeout(() => {
      nextQuestion();
    }, 300);
  }

  // 次の質問へ移動するメソッド
  function nextQuestion() {
    Quiz.currentNum++;
    setQuiz();
  }

  // クイズが終了した時のメソッド
  function endQuiz() {
    removeChildNode(answers);

    // ゲームを終了し、結果を表示する
    question.textContent = 'ゲームが終了しました。';
    gauge.style.display = 'none';
    result.textContent = `クイズ数は合計で${Quiz.currentNum}問、正解数は${Quiz.successCount}、ミス数は${Quiz.missCount}でした！`;
    restart.style.display = 'block';
    gauge.style.width = '0%';
  }

});


