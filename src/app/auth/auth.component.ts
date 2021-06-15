import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthentificationService } from '../core/services/app/auth.service';
import { Authentification } from '../core/models/auth.schema';
import { DatePipe } from '@angular/common';
import { FORMAT_yyyy_MM_dd } from '../core/constants';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  //Form
  authForm: FormGroup;
  showError: boolean;
  masterAddIdentifiant: boolean;

  constructor(private authService: AuthentificationService, private router: Router, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.initForm();
    this.createIdentifiant()
  }

  addAuthentification(identifiant: string, isMaster: boolean, id : number) {
    var newAuth = new Authentification()
    newAuth.id = 1
    newAuth.identifiant = identifiant
    newAuth.isMaster = isMaster
    newAuth.creationDate = this.datePipe.transform(new Date(), FORMAT_yyyy_MM_dd)

    this.addIdentifiant(newAuth)
  }

  changeMode(){
    this.masterAddIdentifiant = true
  }

  createIdentifiant(){
    this.addAuthentification("admin972easapp", true, 1)
    this.addAuthentification("normal972easapp", false, 2)
  }

  checkAsMaster() {
    console.log("Log as master")
    var auth = this.checkAuth()

    if (auth == undefined) {
      this.showError = true
    } else {
      if (auth.isMaster) {
        this.showError = false
        this.displayAddIdentifiantForm()
      } else {
        this.showError = true
      }
    }

  }
  showAuthError() {
    throw new Error('Method not implemented.');
  }

  checkAuth(): Authentification {
    var authRetrieve: Authentification
    this.authService.getAuthByIdentifiant(this.authForm.get('identifiant').value).subscribe((authRetrieved) => {
      authRetrieve = authRetrieved
    });
    return authRetrieve
  }

  //Forms
  initForm() {
    this.authForm = new FormGroup({
      id: new FormControl(),
      identifiant: new FormControl(null, Validators.required)
    })
  }

  btnClick() {
    console.log("CLICK ON VERS HOME")
    this.goToHomePage()
    //this.router.navigate(['/home']);
  }

  displayAddIdentifiantForm() {
    console.log("IS A MASTER PASSWORD")
    this.authForm.reset()
    this.masterAddIdentifiant = true
  }

  goToHomePage() {
    this.router.navigateByUrl('/bottom-nav/home');
  }

  onSubmit() {
    console.log("Identifiant " + this.authForm.get('identifiant').value);
    if(this.masterAddIdentifiant){
      console.log("ADD identifiant")
      if(this.authForm.get('identifiant').value != ""){
        console.log("Before adding")
        this.addAuthentification(this.authForm.get('identifiant').value, false, null)
        this.alertWithSuccess("Le nouvel identifiant a bien été créé.")
        this.masterAddIdentifiant = false
        this.showError = false
        this.authForm.reset()
      }else {
        this.showError = true
      }
    } else {
      console.log(this.authForm);
      var auth = this.checkAuth()
      console.log("AUTH RETRIEVED : ", JSON.stringify(auth))
  
      if (auth === undefined) {
        console.log("IS UNDEFINED ")
        this.showError = true
      } else {
        this.showError = false
        this.goToHomePage()
      }
    }
    
  }
  cancel(){
    this.masterAddIdentifiant = false
    this.authForm.reset()
  }

  alertWithSuccess(message) {
    Swal.fire('Ajout d\'un nouvel identifiant', message, 'success')
  }

  addIdentifiant(authToAdd: Authentification) {
    this.authService.addAuthentification(authToAdd).subscribe(
      (auth) => {
        console.log("AUTH ADDED ", JSON.stringify(auth))
      },
      (error) => this.errorAlert()
    );
  }


  errorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout d\'identifiant',
      text: 'Quelque chose s\'est mal passé!',
      footer: '<a href>Contacter le service</a>'
    })
  }


}
