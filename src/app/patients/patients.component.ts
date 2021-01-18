import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Patient } from '../core/models/patient.schema';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { PatientService } from '../core/services/app/patient.service';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class PatientsComponent implements OnInit {

  //Form
  patientForm: FormGroup;
  displayForm = false;
  newPatient = false;
  updatingPatient = false;

  patientList: Patient[] = [];

  displayedColumns = ['id', 'firstname', 'lastname', 'phoneNumber', 'email', 'address', 'comment', 'actions'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataSource: Patient[];

  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
    this.initForm();
    this.patientService.getPatients().subscribe((patients) => (this.patientList = patients));
    this.updateDatasource();

  }

  //Forms
  initForm() {
    this.patientForm = new FormGroup({
      id: new FormControl(),
      firstname: new FormControl(null, Validators.required),
      lastname: new FormControl(null, Validators.required),
      address:new FormControl(null),
      email: new FormControl(null),
      phoneNumber: new FormControl(null),
      comment: new FormControl()
    })
  }

  onSubmit() {
    console.log(this.patientForm);
    console.log("Firstname value " + this.patientForm.get('firstname').value);
    console.log("id value " + this.patientForm.get('id').value);

    let patient = new Patient();
    patient.firstname = this.patientForm.get('firstname').value;
    patient.lastname = this.patientForm.get('lastname').value;
    patient.address = this.patientForm.get('address').value;
    patient.email = this.patientForm.get('email').value;
    patient.phoneNumber = this.patientForm.get('phoneNumber').value;
    patient.comment = this.patientForm.get('comment').value;

    if(this.newPatient){
      console.log("Submit NEW")
      this.patientService.addPatient(patient).subscribe(
        (patients) => {
          this.patientList = patients
          this.alertWithSuccess('Le patient a été ajouté avec succès')
          this.clearPatientForm()
          this.displayForm=false;
          this.newPatient=false;
        },
        (error) => this.errorAlert()
  
  
      );
    } else if(this.updatingPatient){
      console.log("Submit UPDATE")
      patient.id=this.patientForm.get('id').value;
      this.patientService.updatePatient(patient).subscribe(
        (patients) => {
          this.patientList=patients;
          this.alertWithSuccess('Le patient a été modifié avec succès')
          this.clearPatientForm()
        }
      )
    }
    
    this.updateDatasource();
  }
  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification du patient', message, 'success')
  }

  errorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout',
      text: 'Quelque chose s\'est mal passé!',
      footer: '<a href>Contacter le service</a>'
    })
  }

  clearPatientForm() { 
    this.patientForm.reset();
    this.displayForm = false;
  }

  //Ajouter un patient
  displayPatientForm(newpatient : boolean) {
    if(newpatient){
      this.newPatient=true;
      this.updatingPatient = false;
    } else {
      this.updatingPatient = true;
      this.newPatient = false;
    }
    if(!this.displayForm) {
      this.displayForm = !this.displayForm;
    }
      
  }

  //Actions on patient
  editPatient(patient : Patient) {
    this.displayPatientForm(false); //Edit user
    console.log("Editer : " + JSON.stringify(patient))
    this.patientForm.controls["id"].setValue(patient.id);
    this.patientForm.controls["firstname"].setValue(patient.firstname);
    this.patientForm.controls["lastname"].setValue(patient.lastname);
    this.patientForm.controls["address"].setValue(patient.address);
    this.patientForm.controls["email"].setValue(patient.email);
    this.patientForm.controls["phoneNumber"].setValue(patient.phoneNumber);
  
  }

  deletePatient(patient): void {
    console.log("Suppression du patient : " +JSON.stringify(patient));
    this.confirmBox(patient)
    
  }

  confirmBox(patient:Patient){  
    let patientName = patient.firstname + " " + patient.lastname;
    Swal.fire({  
      title: 'Etes-vous sûr de vouloir supprimer ' + patientName + " ?",  
      text: 'La suppression est irréversible.',  
      icon: 'warning',  
      showCancelButton: true,  
      confirmButtonText: 'Oui, sûr',  
      cancelButtonText: 'Non, je le garde'  
    }).then((result) => {  
      if (result.value) {  
        this.patientService
      .deletePatient(patient)
      .subscribe(
        (patients) => {
          this.patientList = patients
          Swal.fire(  
            'Supprimé!',  
            patientName + ' a bien été supprimé.',  
            'success'  
          )  
        },
        (error) => {
          Swal.fire(  
            'Erreur',  
            'Echec de la suppression',  
            'error'  
          ) 
        }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {  
        Swal.fire(  
          'Annulé',  
          'Suppression annulée',  
          'error'  
        )  
      }  

    this.updateDatasource();
    })  
  }  

  updateDatasource(){
    this.dataSource = this.patientList;
  }

  planning() {
    console.log("PLanning")
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  shuffle() {
    let currentIndex = this.columnsToDisplay.length;
    while (0 !== currentIndex) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap
      let temp = this.columnsToDisplay[currentIndex];
      this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
      this.columnsToDisplay[randomIndex] = temp;
    }
  }

}
