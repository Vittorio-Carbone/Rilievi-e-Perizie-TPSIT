declare let google: any;
import { ViewportScroller } from '@angular/common';
import { Geolocation } from '@capacitor/geolocation';
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

  coord: any;
  latOp: any;
  lngOp: any;
  mappa: boolean = false;
  map: any;
  cod: string = "";
  nome: string = "";
  cognome: string = "";
  mail: string = "";
  user: any = [];
  perizie: any = [];
  id: any;
  lunghezza: any="";
  durata: any="";
  constructor(private viewportScroller: ViewportScroller,private route: ActivatedRoute, public photoService: PhotoService, public dataStorageService: DataStorageService, public router: Router) { }
  ngOnInit(): void {
    let promise: any = [];
    const printCurrentPosition = async () => {
      const coordinates = await Geolocation.getCurrentPosition();
      let latOp = coordinates.coords.latitude;
      let lngOp = coordinates.coords.longitude;
      return latOp + " " + lngOp;
    };
    promise.push(printCurrentPosition());
    Promise.all(promise).then((values) => {
      this.coord = values[0].split(" ");
      this.latOp = parseFloat(this.coord[0]);
      this.lngOp = parseFloat(this.coord[1]);
    });
    
    if (this.photoService.user._id == undefined) {
      this.id = this.route.snapshot.paramMap.get('id');
    } else {
      this.id = this.photoService.user._id;
    }


    this.dataStorageService.inviaRichiesta('get', '/getPerito/' + this.id)?.subscribe({
      "next": (data: any) => {
        console.log(data);
        this.photoService.user = data;
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
  initMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: this.latOp, lng: this.lngOp },
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false
    });
  }


  logOut() {
    this.router.navigate(['/tabs/tab1']);
  }




  caricaMappa(coord: any) {
    
    
    this.mappa = true;
    let lat = parseFloat(coord.split(", ")[0]);
    let lng = parseFloat(coord.split(", ")[1]);

    caricaGoogleMaps().then(() => {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();

      const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: { lat: this.latOp, lng: this.lngOp },
        mapTypeControl: false,
        fullscreenControl: false
      });

      directionsRenderer.setMap(map);

      const request = {
        origin: { lat: this.latOp, lng: this.lngOp },
        destination: { lat: lat, lng: lng },
        travelMode: 'DRIVING'
      };

      directionsService.route(request,  (result: any, status: string) => {
        if (status == 'OK') {
          directionsRenderer.setDirections(result);

          const route = result.routes[0];
          const leg = route.legs[0];

          const distance = leg.distance.text;
          const duration = leg.duration.text;

          this.lunghezza = distance;
          this.durata = duration;
        }
      });

      directionsService.route(request, function (result: any, status: string) {
        if (status == 'OK') {
          directionsRenderer.setDirections(result);
        }
      });
    }).catch((error) => {
      console.error("Errore caricamento GoogleMaps", error);
    });

  }







  chiudiMappa() {
    this.mappa = false;
  }

}
const URL_MAPS = "https://maps.googleapis.com/maps/api"
const MAP_KEY = "AIzaSyBZKYgxbiyRE7DknUpnRP2QHCBVjvLgH7g"
function caricaGoogleMaps() {
  let promise = new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = URL_MAPS + '/js?v=3&key=' + MAP_KEY;
    document.body.appendChild(script);
    script.onload = resolve;
    script.onerror = reject;
    script.onerror = function () {
      throw new Error("Errore caricamento GoogleMaps")
    }
  })
  return promise
}

