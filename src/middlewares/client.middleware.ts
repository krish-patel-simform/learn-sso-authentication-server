import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse } from '../types/api/api.types.js';
import { findClient, isRedirectUriAllowed } from '../services/client.service.js';

export async function validateClient(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    // query values are NOT guaranteed to be strings (?a=1&a=2 gives an array, ?a[x]=1 gives an object)
    // so every one is checked with typeof below
    const { client_id, redirect_uri, response_type, state, code_challenge, code_challenge_method } =
      req.query;

    if (
      typeof client_id !== 'string' ||
      typeof redirect_uri !== 'string' ||
      typeof state !== 'string' ||
      typeof code_challenge !== 'string' ||
      !client_id ||
      !redirect_uri ||
      !state ||
      !code_challenge
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
      });
    }

    // check the client exists
    const client = await findClient(client_id);

    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Unknown client',
      });
    }

    // the uri must be one of the client's REGISTERED uris (client.redirectUris),
    // not the list from the request itself, otherwise any uri would pass
    if (!isRedirectUriAllowed(client, redirect_uri)) {
      return res.status(400).json({
        success: false,
        message: 'Redirect URI is not exist in the registered callbacks',
      });
    }

    if (response_type !== 'code') {
      return res.status(400).json({
        success: false,
        message: 'response_type must be code',
      });
    }

    if (code_challenge_method !== 'S256') {
      return res.status(400).json({
        success: false,
        message: 'code_challenge_method must be S256',
      });
    }

    // so the controller does not have to query the client again
    res.locals.client = client;

    next();
  } catch (error) {
    console.log('[validate client middleware] error :', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}
