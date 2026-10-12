import { model, Schema, type HydratedDocument, type Types } from 'mongoose';

export interface IClient {
  name: string;
  clientId: string;
  clientSecretHash: string;
  redirectUris: string[];
  createdBy: Types.ObjectId;
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    // public id, the app sends it on every /authorize and /token call
    clientId: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    // only the hash is stored, the real secret is shown once at registration
    clientSecretHash: {
      type: Schema.Types.String,
      required: true,
      select: false,
    },
    // the only urls we are allowed to send the user back to after login
    redirectUris: {
      type: [String],
      required: true,
      validate: [(uris: string[]) => uris.length > 0, 'At least one redirect uri is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  { timestamps: true },
);

export type ClientDocument = HydratedDocument<IClient>;

export const ClientModel = model<IClient>('clients', clientSchema);
