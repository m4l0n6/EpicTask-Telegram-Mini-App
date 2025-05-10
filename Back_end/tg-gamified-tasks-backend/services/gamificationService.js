const User = require('../models/User');
const Task = require('../models/Task');
const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');
const leaderboardService = require('./leaderboardService'); 
const SocketService = require('./socketService');


const LEVEL_XP_THRESHOLD = 100;  

 
const awardXp = async (userId, xpToAdd) => {
  try {
    console.log(`[GamificationService] Awarding ${xpToAdd} XP to ${userId}`);
    if (!userId || xpToAdd <= 0) return { user: null, leveledUp: false };

    const user = await User.findById(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    const oldXp = user.xp || 0;
    const oldLevel = user.level || 1;
    const newXp = oldXp + xpToAdd;

    // Tính toán level mới
    const newLevel = Math.floor(newXp / 100) + 1;

    // Cập nhật thông tin người dùng
    user.xp = newXp;
    user.level = newLevel;
    await user.save();

    const leveledUp = newLevel > oldLevel;

    // Kiểm tra và trao huy hiệu dựa trên các tiêu chí
    if (leveledUp && io) {
      SocketService.notifyLevelUp(io, userId, { oldLevel, newLevel });
    }

    // 2. Kiểm tra số nhiệm vụ đã hoàn thành
    const completedTaskCount = await Task.countDocuments({
      owner: userId,
      completed: true,
    });
    await checkAndAwardBadges(userId, { tasksCompleted: completedTaskCount });

    return { user, leveledUp };
  } catch (err) {
    console.error(`[GamificationService] Error awarding XP to ${userId}:`, err);
    return { user: null, leveledUp: false };
  }
};

 
const checkAndAwardBadges = async (userId, criteria) => {
    console.log(`[GamificationService - Placeholder] Checking badges for ${userId} with criteria:`, criteria);
    try {
        const existingUserBadges = await UserBadge.find({ user: userId }).select('badge -_id');
        const existingBadgeIds = existingUserBadges.map(ub => ub.badge);

        const potentialBadges = await Badge.find({ _id: { $nin: existingBadgeIds } });  

        const newlyAwardedBadges = [];
        for (const badge of potentialBadges) {
            let eligible = false;
            if (badge.milestoneType === 'tasksCompleted' && criteria.tasksCompleted >= badge.milestoneValue) {
                eligible = true;
            } else if (badge.milestoneType === 'levelReached' && criteria.level >= badge.milestoneValue) {
                eligible = true;
            }

            if (eligible) {
              console.log(
                `[GamificationService] Awarding badge "${badge.title}" to ${userId}`
              );
              await UserBadge.create({ user: userId, badge: badge._id });
              newlyAwardedBadges.push(badge);

              // Thêm thông báo qua WebSocket nếu io được cung cấp
              if (io) {
                SocketService.notifyNewBadge(io, userId, badge);
              }
            }
        }
        return newlyAwardedBadges;
    } catch (err) {
        console.error(`[GamificationService] Error checking/awarding badges for ${userId}:`, err);
        return [];
    }
};

// Thêm hàm này vào cuối file, trước module.exports
const awardTokens = async (userId, tokensToAdd) => {
  console.log(`[GamificationService] Awarding ${tokensToAdd} tokens to ${userId}`);
  if (!userId || tokensToAdd <= 0) return null;

  try {
    const user = await User.findById(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    const oldTokens = user.tokens || 0;
    const newTokens = oldTokens + tokensToAdd;

    user.tokens = newTokens;
    await user.save();

    console.log(`[GamificationService] User ${userId} tokens updated: ${oldTokens} -> ${newTokens}`);
    return user;
  } catch (err) {
    console.error(`[GamificationService] Error awarding tokens to ${userId}:`, err);
    return null;
  }
};

module.exports = {
  awardXp,
  checkAndAwardBadges,
  awardTokens // Thêm export cho hàm mới
};