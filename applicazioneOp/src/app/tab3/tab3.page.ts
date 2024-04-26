import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { DataStorageService } from '../services/data-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  cod: string = "";
  nome: string = "";
  cognome: string = "";
  mail: string = "";
  user: any = [];
  perizie: any = [];
  id:any;
  constructor(private route: ActivatedRoute, public photoService: PhotoService, public dataStorageService: DataStorageService, public router: Router) { }
  ngOnInit(): void {
    if (this.photoService.user._id == undefined) {
      this.id = this.route.snapshot.paramMap.get('id');
    } else {
      this.id = this.photoService.user._id;
    }


    this.dataStorageService.inviaRichiesta('get', '/getPerito/'+this.id)?.subscribe({
      "next": (data: any) => {
        console.log(data);
        this.photoService.user=data;
        this.user = data;
        this.dataStorageService.inviaRichiesta('get', '/getPerizie/' + this.user.codOperatore)?.subscribe({
          "next": (data: any) => {
            console.log(data);
            this.perizie = data
    
          },
          "error": (error: any) => {
            console.log(error);
          }
        });
      },
      "error": (error: any) => {
        console.log(error);
      }
    });
    console.log(this.user)
    console.log(this.perizie)
   
  }


  logOut() {
    this.router.navigate(['/tabs/tab1']);
  }
}
