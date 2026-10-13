import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import type { ApiResponse } from '../../types/api/api.types.js';
import { ClientModel } from '../../models/client.model.js';
import { generateClientCredentials, parseRedirectUris } from '../../services/client.service.js';

interface RegisterClientRequestBody {
  clientName: string;
  redirectUris: string[];
}

// authMiddleware runs first: only a logged in user can register an app
export async function registerClient(
  req: Request<unknown, null, RegisterClientRequestBody>,
  res: Response<ApiResponse>,
) {
  try {
    const { clientName, redirectUris } = req.body;

    if (!clientName || !redirectUris) {
      return res.status(400).json({
        success: false,
        message: 'Required field are missing',
      });
    }

    // checks every uri is a valid https url (or http while developing)
    const uris = parseRedirectUris(redirectUris);

    if (!uris) {
      return res.status(400).json({
        success: false,
        message: 'redirectUris must be a list of valid http(s) urls without a # fragment',
      });
    }

    const { clientId, clientSecret, clientSecretHash } = generateClientCredentials();

    await ClientModel.create({
      name: clientName,
      clientId,
      clientSecretHash,
      redirectUris: uris,
    });

    return res.status(201).json({
      success: true,
      message: 'Client registered. Save the clientSecret now, it will not be shown again',
      data: {
        clientId,
        clientSecret,
        redirectUris: uris,
      },
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0]?.message ?? 'Invalid data',
      });
    }

    console.log('[register client controller] error : ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
