import { SessionModel } from '../../models/session.model.js';

export async function removeSession(id: string) {
  try {
    const session = await SessionModel.deleteOne({
      _id: id,
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
