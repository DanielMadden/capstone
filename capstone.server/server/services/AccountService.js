import { dbContext } from '../db/DbContext'
// import BaseController from '../utils/BaseController'
// import { BadRequest } from '../utils/Errors'

// Private Methods

/**
 * Creates account if one does not exist
 * @param {any} account
 * @param {any} user
 */
async function createAccountIfNeeded(account, user) {
  if (!account) {
    user._id = user.id
    account = await dbContext.Account.create({
      ...user,
      subs: [user.sub]
    })
  }
  return account
}

/**
 * Adds sub to account if not already on account
 * @param {any} account
 * @param {any} user
 */
async function mergeSubsIfNeeded(account, user) {
  if (!account.subs.includes(user.sub)) {
    // @ts-ignore
    account.subs.push(user.sub)
    await account.save()
  }
}
/**
 * Restricts changes to the body of the account object
 * @param {any} body
 */
function sanitizeBody(body) {
  const writable = {
    name: body.name,
    phones: body.phones,
    addresses: body.addresses,
    notes: body.notes,
    picture: body.picture
  }
  return writable
}

class AccountService {
  async getAccountByEmail(email) {
    return await dbContext.Account.findOne({ email: email })
  }

  // TODO review account edit security
  async edit(accountUpdate, id) {
    const account = await dbContext.Account.findOneAndUpdate({
      _id: id
    }, accountUpdate)
    return account
  }

  async getAccountsByQuery(name, email) {
    const accounts = await dbContext.Account.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: name, $options: 'i' } },
            { email: { $regex: email, $options: 'i' } }
          ]
        }
      }
    ])
      .collation({ locale: 'en_US', strength: 1 })
      .limit(8)
      .exec()
    return accounts
  }

  /**
   * Provided an array of user ids will return an array of user accounts with email picture and name
   * @param {String[]} ids Array of email addresses to lookup users by
   */
  async getAccounts(ids = []) {
    const accounts = await dbContext.Account.find({
      _id: { $in: ids }
    })
    return accounts
  }

  /**
   * Returns a user account from the Auth0 user object
   *
   * Creates user if none exists
   *
   * Adds sub of Auth0 account to account if not currently on account
   * @param {any} user
   */
  async getAccount(user) {
    let account = await dbContext.Account.findOne({
      _id: user.id
    })
    account = await createAccountIfNeeded(account, user)
    await mergeSubsIfNeeded(account, user)
    return account
  }

  /**
   * Updates account with the request body, will only allow changes to editable fields
   *  @param {any} user Auth0 user object
   *  @param {any} body Updates to apply to user object
   */
  async updateAccount(user, body) {
    const update = sanitizeBody(body)
    const account = await dbContext.Account.findOneAndUpdate(
      { _id: user.id },
      { $set: update },
      { runValidators: true, setDefaultsOnInsert: true, new: true }
    )
    return account
  }
}
export const accountService = new AccountService()
