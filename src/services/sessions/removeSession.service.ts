import { SessionModel } from '../../models/session.model.js';

// removes the session AND every app session made from it (parentSessionId), so logging out of
// the SSO also logs out of every app. an app session has no children, so for it only itself is removed
export async function removeSession(id: string) {
  try {
    const session = await SessionModel.deleteMany({
      $or: [{ _id: id }, { parentSessionId: id }],
    });

    if (!session || session.deletedCount <= 0) {
      return null;
    }

    return session.acknowledged;
  } catch (error) {
    console.log('[remove session service] error : ', error);

    return null;
  }
}
