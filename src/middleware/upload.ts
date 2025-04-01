import { NextFunction, Request, Response } from "express";
import multer from "multer";


declare global{
  namespace Express{
    interface Request{
      restaurantImage?: Express.Multer.File;
      menuItemImage?: Express.Multer.File[];
    }
  }
}

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
});


export const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.fields([
    { name: 'imageFile', maxCount: 1 },
    { name: 'files', maxCount: 10 }
  ])(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Now req.files is available
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const restaurantImage = files['imageFile']?.[0]
    const menuItemImage = files['files'] || [];

    req.restaurantImage = restaurantImage
    req.menuItemImage = menuItemImage

    next();
  });
};
