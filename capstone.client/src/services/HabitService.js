import { AppState } from '../AppState'
import { logger } from '../utils/Logger'
import { accountService } from './AccountService'
import { api } from './AxiosService'
import { habitHistoryService } from './HabitHistoryService'

const baseURL = '/api/habits/'

class HabitService {
  async getGroupHabits(groupId) {
    const res = await api.get('/api/groups/' + groupId + '/habits')
    AppState.activeGroupHabits = res.data
  }

  async getAccountHabits(accountId) {
    const res = await api.get('/api/accounts/' + accountId + '/habits')
    AppState.accountHabits = res.data
  }

  async getHabit(habitId) {
    const res = await api.get(baseURL + habitId)
    AppState.activeHabit = res.data
  }

  async getHabitToday(habitId) {
    AppState.activeHabitToday = await habitHistoryService.getToday(habitId)
  }

  async createHabit(data) {
    await api.post(baseURL, data)
    this.getGroupHabits(data.groupId)
  }

  async editHabit(data, habitId) {
    const res = await api.put(baseURL + habitId, data)
    this.getGroupHabits(res.data.groupId)
  }

  async completeHabit(habitId, groupId) {
    const res = await api.put(baseURL + habitId + '/complete')
    logger.log(res)
    this.getGroupHabits(groupId)
    accountService.getHabits(AppState.account.email)
  }

  async deleteHabit(habitId) {
    const res = await api.delete(baseURL + habitId)
    this.getGroupHabits(res.data.groupId)
  }
}

export const habitService = new HabitService()
