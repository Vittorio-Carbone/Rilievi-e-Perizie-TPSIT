import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { DataStorageService } from './data-storage.service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public newPass: boolean = false;
  public user: any = [];
  public _id: any;
  public photos: any[] = [];
  public descrizionePhoto: any[] = [];

  private PHOTO_STORAGE: string = 'photos';

  private platform: Platform;
  photoService: any;

  base64ToImage: any;
  image: any;

  constructor(platform: Platform, private dataStorageService: DataStorageService) {
    this.platform = platform;
  }


  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    console.log(capturedPhoto);
    // Save the picture and add it to photo collection
    const savedImageFile = await this.savePicture(capturedPhoto);
    console.log(savedImageFile);
    this.photos.unshift(savedImageFile);
    this.descrizionePhoto.unshift('');

    

  }

  private async savePicture(photo: Photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);
    return base64Data;

  }


  private async readAsBase64(photo: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path!
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

 public async blobToBase64(blob: Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result.toString().replace(/^data:,/, ''));
      } else {
        reject(new Error('Error reading Blob'));
      }
    };
    reader.readAsDataURL(blob);
  });
}

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

}
