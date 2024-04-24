import { Component } from '@angular/core';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  constructor(public alertController: AlertController, public photoService: PhotoService, public actionSheetController: ActionSheetController) { }

  next() {

    this.descrizionePer();

  }





  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  public async showActionSheet(photo: any, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Elimina',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          //cosa fa se clicco su ELIMINA
          console.log('Delete clicked', position);
          this.photoService.photos.splice(position, 1);
          this.photoService.descrizionePhoto.splice(position, 1);
        }
      }, {
        text: 'Annulla',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
        }
      }, {
        text: 'Descrizione',
        icon: 'pen',
        handler: () => {
          //cosa fa se clicco su DESCRIZIONE
          this.presentAlertPrompt(position);
        }
      }]
    });
    await actionSheet.present();
  }
  async presentAlertPrompt(position: number) {
    const alert = await this.alertController.create({
      header: 'Inserisci la descrizione della foto',
      inputs: [
        {
          name: 'name1',
          type: 'textarea',
          value: this.photoService.descrizionePhoto[position]
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.photoService.descrizionePhoto[position] = data.name1;
            console.log(this.photoService.descrizionePhoto)
          }
        }
      ]
    });

    await alert.present();
  }



  async descrizionePer() {
    const alert = await this.alertController.create({
      header: 'Inserisci una descrizione generale per la perizia',
      inputs: [
        {
          name: 'name1',
          type: 'textarea',
          placeholder: 'Descrizione generale della perizia'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log(data.name1)
            let desc = this.photoService.descrizionePhoto;
            let photos = this.photoService.photos;
            let date = new Date();
            let formattedDate = date.toLocaleDateString('it-IT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour12: false
            });
            formattedDate = formattedDate.replace(/\//g, "-");
            let time = date.getTime();
            let formattedTime = date.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            let latLng: string

            const printCurrentPosition = async () => {
              const coordinates = await Geolocation.getCurrentPosition();
              latLng = coordinates.coords.latitude + ", " + coordinates.coords.longitude;
              let perizia = {
                data: formattedDate,
                ora: formattedTime,
                latLng: latLng,
                descrizione: data.name1,
              }
              console.log(perizia);
            };
            printCurrentPosition();


          }
        }
      ]
    });

    await alert.present();
  }

}

