import fs from 'fs/promises';
import { NotFoundError, BadRequestError } from '../utils/errors/app.error.js';

export const pingController = async (req, res, next) => {
  try {
    await fs.readFile('sample.txt');
    
    res.status(200).json({ 
      status: 'success',
      message: 'Pong!' 
    });
    
  } catch (error) {
    // Clean and readable!
    throw new NotFoundError('File not found');
  }
};