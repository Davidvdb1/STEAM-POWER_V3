class Achievement {
  constructor({
    id = undefined,
    title,
    description,
    reward
  }, validate = true) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.reward = reward;
    if (validate) this.validate();
  }

  validate() {
    if (!this.title || typeof this.title !== 'string') {
      throw new Error('Invalid title');
    }
    if (!this.description || typeof this.description !== 'string') {
      throw new Error('Invalid description');
    }
    if (typeof this.reward !== 'number' || this.reward < 0) {
      throw new Error('Invalid reward');
    }
  }

  static from(prismaAchievement) {
    return new Achievement({
      id: prismaAchievement.id,
      title: prismaAchievement.title,
      description: prismaAchievement.description,
      reward: prismaAchievement.reward
    });
  }
}

module.exports = Achievement;