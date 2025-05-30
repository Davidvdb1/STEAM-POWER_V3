class Achievement {
  constructor({
    id = undefined,
    title,
    description,
    reward,
    score
  }, validate = true) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.reward = reward;
    this.score = score;
    if (validate) this.validate();
  }

  validate() {
    if (!this.title || typeof this.title !== 'string') {
      throw new Error('Invalid title');
    }
    if (!this.description || typeof this.description !== 'string') {
      throw new Error('Invalid description');
    }
    if (!this.reward || typeof this.reward !== 'number' || this.reward < 0) {
      throw new Error('Invalid reward');
    }
    if (!this.score || typeof this.score !== 'number') {
      throw new Error('Invalid score');
    }
  }

  static from(prismaAchievement) {
    return new Achievement({
      id: prismaAchievement.id,
      title: prismaAchievement.title,
      description: prismaAchievement.description,
      reward: prismaAchievement.reward,
      score: prismaAchievement.score
    });
  }
}

module.exports = Achievement;