import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PhotoService } from '../services/photo.service';
import { DataStorageService } from '../services/data-storage.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  username: string = "";
  pwd: string = "";
  lblPwd: boolean = false;
  lblErr: boolean = false;
  lblChange: boolean = false;
  constructor(public dataStorageService: DataStorageService, private router: Router, public photoService: PhotoService) { }

  pwdDimenticata() {
    if (this.username == "") {
      this.lblChange = true;
      setTimeout(() => {
        this.lblChange = false;
      }, 4000);
    }
    else {

      this.dataStorageService.inviaRichiesta('post', '/nuovaPassword', { "username": this.username })?.subscribe({
        "next": (data: any) => {
          this.lblPwd = true;
          setTimeout(() => {
            this.lblPwd = false;
          }, 4000);
        },
        "error": (error: any) => {
          console.log(error);
        }
      });
    }
  }
  loginGoogle() {
    console.log(this.username + " " + this.pwd);
    // google.accounts.id.initialize({
    //   "client_id": oAuthId,
    //   "callback": function (response) {
    //     if (response.credential !== "") {
    //       let token = response.credential
    //       console.log("token:", token)
    //       localStorage.setItem("token", token)
    //       /* window.location.href = "index.html" oppure */
    //       this.dataStorageService.inviaRichiesta('post', '/googleLogin')?.subscribe({
    //         "next": (data:any) => {
    //           let _id = data._id;
    //           window.location.href = `index.html?id=${_id}`
    //         },
    //         "error": (error:any) => {
    //           console.log(error);
    //         }
    //       });
    //     }
    //   }
    // })
    // google.accounts.id.renderButton(
    //   document.getElementById("googleDiv"), // qualunque tag DIV della pagina
    //   {
    //     "theme": "outline",
    //     "size": "large",
    //     "type": "standard",
    //     "text": "continue_with",
    //     "shape": "rectangular",
    //     "logo_alignment": "center"
    //   }
    // );
    // google.accounts.id.prompt();
  }
  login() {
    let username = this.username;
    let pwd = this.pwd;
    console.log(username + " " + pwd);

    this.dataStorageService.inviaRichiesta('post', '/login', { "username": username, "password": pwd })?.subscribe({
      "next": (data) => {
        console.log(data)
        this.photoService._id = data['_id'];
        this.router.navigate(['/tabs/tab2', { id: this.photoService._id }]);
      },
      "error": (error) => {
        console.log(error);
        this.lblErr = true;
        setTimeout(() => {
          this.lblErr = false;
        }, 4000);
      }
    });

  }
}
