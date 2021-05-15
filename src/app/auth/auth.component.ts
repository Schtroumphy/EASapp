import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  //Form
  authForm: FormGroup;

constructor(private router: Router) {}  

  ngOnInit(): void {
    this.initForm();
    let currentUrl = this.router.url;
    console.log("IN AUTH CURRENT URL : ", currentUrl )
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
    this.router.navigateByUrl('/bottom-nav/home');
    //this.router.navigate(['/home']);
  }

  onSubmit() {
    console.log(this.authForm);
    console.log("Identifiant " + this.authForm.get('identifiant').value);
  }


  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification du patient', message, 'success')
  }

}
