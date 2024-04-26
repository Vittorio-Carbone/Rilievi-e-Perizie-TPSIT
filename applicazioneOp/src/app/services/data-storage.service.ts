import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  private REST_API_SERVER = "https://localhost:3000/api";

  constructor(private httpClient: HttpClient) { }

  public inviaRichiesta(method:string, resource:string, params:any = {}):Observable<any> | undefined {
    resource = this.REST_API_SERVER + resource

    switch(method.toLowerCase()) {
      case "get":
        return this.httpClient.get(resource, {params: params, observe: "response"}).pipe(map((response: HttpResponse<any>) => {
          const authHeader = response.headers.get("authorization")

          localStorage.setItem("authToken", authHeader!)

          return response.body
        }))

      case "delete":
        return this.httpClient.delete(resource, {body: params, observe: "response"}).pipe(map((response: HttpResponse<any>) => {
          const authHeader = response.headers.get("authorization")

          localStorage.setItem("authToken", authHeader!)

          return response.body
        }))

      case "post":
        return this.httpClient.post(resource, params, { observe: "response" }).pipe(map((response: HttpResponse<any>) => {
          const authHeader = response.headers.get("authorization")

          localStorage.setItem("authToken", authHeader!)

          return response.body
        }))

      case "put":
        return this.httpClient.put(resource, params, { observe: "response" }).pipe(map((response: HttpResponse<any>) => {
          const authHeader = response.headers.get("authorization")

          localStorage.setItem("authToken", authHeader!)

          return response.body
        }))

      default:
        return undefined
    }
  } 
}