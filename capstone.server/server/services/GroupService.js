import { dbContext } from '../db/DbContext'
import { BadRequest } from '../utils/Errors'
import { groupMemberService } from '../services/GroupMemberService'

class GroupService {
  async getGroupsByAccountId(accountId) {
    const groupMembers = await dbContext.GroupMembers.find({ memberId: accountId })
    // const noPending = groupMembers.filter(groupMember => groupMember.status !== 'Pending')
    const groupIds = groupMembers.map(groupMember => groupMember.groupId)
    return await dbContext.Groups.find({ _id: { $in: groupIds } })
  }

  async getAll(query = {}) {
    const groups = await dbContext.Groups.find({ ...query, private: false }).populate('creator')
    return groups
  }

  async findById(id) {
    const group = await dbContext.Groups.findById({ _id: id }).populate('creator')
    if (!group) {
      throw new BadRequest('Invalid Id')
    }
    return group
  }

  async create(group) {
    const newGroup = await dbContext.Groups.create(group)
    newGroup.toObject()
    const newGroupMember = { memberId: group.creatorId, groupId: newGroup.id, status: 'Moderator' }
    groupMemberService.create(newGroupMember)
    return newGroup
  }

  async edit(id, update) {
    const group = await dbContext.Groups.findOneAndUpdate({ _id: id }, update, { new: true }).populate('creator')
    if (!group) {
      throw new BadRequest('You are not the user, or this is not a valid group')
    }
    return group
  }

  async delete(groupId, userId) {
    const relationship = await dbContext.GroupMembers.findOne({ groupId: groupId, memberId: userId })
    if (!relationship) return 'Not part of group'
    if (relationship.status !== 'Moderator') return 'Unauthorized'
    const group = await dbContext.Groups.findOneAndRemove({ _id: groupId })
    if (!group) return 'No group by id'
    await dbContext.Habits.deleteMany({ groupId: groupId })
    await dbContext.GroupMembers.deleteMany({ groupId: groupId })
    await dbContext.Messages.deleteMany({ groupId: groupId })
    return group
  }
}

export const groupService = new GroupService()
