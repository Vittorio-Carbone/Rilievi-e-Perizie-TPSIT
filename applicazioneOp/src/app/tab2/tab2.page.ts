import { Component } from '@angular/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { PhotoService } from '../services/photo.service';
import { DataStorageService } from '../services/data-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  loader: boolean = false;
  currentPwd:string="";
  newPwd:string="";
  lblErr:boolean=false;
  log: boolean=false;
  constructor(private route: ActivatedRoute,private router: Router, private dataStorageService: DataStorageService, public alertController: AlertController, public photoService: PhotoService, public actionSheetController: ActionSheetController) { }
  ngOnInit(): void {
    let id;
    if(this.photoService.user._id==undefined){
    id = this.route.snapshot.paramMap.get('id');
    }else{
      console.log(this.photoService.user);
      id=this.photoService.user._id;
    }
    console.log(id);
    this.dataStorageService.inviaRichiesta('get', '/getPerito/'+id)?.subscribe({
      "next": (data: any) => {
        console.log(data);
        this.photoService.user=data;
        if(this.photoService.user.newPass){
          this.log=true;
          this.photoService.newPass=true;
        }
      },
      "error": (error: any) => {
        console.log(error);
      }
    });
  }


  next() {
    if (this.photoService.photos.length == 0) {
      this.fotoZero();
    }
    else {
      this.descrizionePer();
    }

  }
  async fotoZero() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Sei sicuro di voler creare una nuova perizia senza foto?',
      buttons: [{
        text: 'Conferma',
        role: 'confirm',
        handler: () => {
          // cosa fa se clicco su CONFERMA
          this.descrizionePer();
        }
      }, {
        text: 'Annulla',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // cosa fa se clicco su ANNULLA
          // Non fare nulla, l'azione viene semplicemente annullata
        }
      }]
    });
    await actionSheet.present();
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
        icon: 'pencil-outline',
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
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.loader = true;
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
                "codOperatore": this.photoService.user.codOperatore,
                "data": formattedDate,
                "ora": formattedTime,
                "coordinate": latLng,
                "descrizione": data.name1,
                "foto": []
              }
              let foto: any = []
              let promise:any=[];
              for (let [index, photo] of photos.entries()) {
                promise.push(firstValueFrom(this.dataStorageService.inviaRichiesta('post', '/addBase64CloudinaryImage', { "codOp": 1, "imgBase64": photo })!))
                
              }
              foto=await Promise.all(promise);
              foto=foto.map((data:any,index:number)=>({ "descrizioneFoto": desc[index], "url": data.url }));
              perizia.foto=foto;
              this.dataStorageService.inviaRichiesta('post', '/addPerizia', { "newPerizia": perizia })?.subscribe({
                "next": (data) => {
                  console.log(data);
                  this.photoService.photos = [];
                  this.photoService.descrizionePhoto = [];
                  this.loader = false;
                },
                "error": (error) => {
                  console.log(error);
                }
              });
            };
            printCurrentPosition();


          }
        }
      ]
    });

    await alert.present();
  }


  changePwd(){
    this.dataStorageService.inviaRichiesta('post', '/cambiaPassword', { "id":this.photoService.user._id,"currentPassword": this.currentPwd,"newPassword": this.newPwd})?.subscribe({
      "next": (data: any) => {
        console.log(data);
        this.photoService.newPass=false;
        this.log=false;
      },
      "error": (error: any) => {
        console.log(error);
        this.lblErr=true;
        setTimeout(() => {
          this.lblErr=false;
        })
      }
    });
  }
}

