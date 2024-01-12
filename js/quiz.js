// クイズクラス
class Quiz {
  static successCount = 0;
  static missCount = 0;
  static currentNum = 0;
  static isAnswered = false;
  static isClicked = false;

  constructor(question, answers) {
    this.question = question;
    this.answers = answers;
  }

}