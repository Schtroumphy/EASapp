import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CalendarOptions, FullCalendarComponent } from '@fullcalendar/angular'; // useful for typechecking
import { Evenement } from '../core/models/evenement.schema';
import { EventService } from '../core/services/app/event.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Driver } from '../core/models/driver.schema';
import { DriverService } from '../core/services/app/driver.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { PatientService } from '../core/services/app/patient.service';
import { Patient } from '../core/models/patient.schema';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  eventList: Evenement[];
  driverList: Driver[];
  patientList: Patient[];
  displayForm = true;
  eventForm : FormGroup
  selectedDriverId : string
  selectedDriver : Driver
  selectedPatientId : string
  selectedPatient: Patient
  dateSelected : string
  selectedJourneyId : string
  journeySelected


  journeyMock = [
    { departure: "Hopital Salut Cren", arrival: "Domicile"},
    { departure: "Hopital Deux Cyr", arrival: "Le François, Bourg"},
    { departure: "Hopital Salut Cren", arrival: "Domicile"},
    { departure: "Carrefour market Robert", arrival: "Hopital Deux Cyr"},
  ]

  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  constructor(private eventService: EventService, private driverService: DriverService, private patientService : PatientService) { }

  ngOnInit(): void {
    this.initForm();
    this.eventService.getEvents().subscribe((items) => (this.eventList = items));
    this.driverService.getDrivers().subscribe((items) => {
      this.driverList = items,
      console.log(items);
    });
    this.patientService.getPatients().subscribe((items) => {
      this.patientList = items,
      console.log(items);
    });
  }

  onPrint() {
    window.print();
  }

  calendarOptions: CalendarOptions = {
    themeSystem: 'bootstrap',
    initialView: 'listWeek',
    timeZone: 'UTC',
    editable: true,
    slotDuration: '00:15',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'listDay timeGridWeek dayGridMonth listWeek',
    },
    dateClick: this.handleDateClick.bind(this), // bind is important!
    events: [
      { title: 'event 1', date: '2020-12-01', backgroundColor:'yellow', },
      { title: 'event 2', date: '2020-12-02',  backgroundColor: 'rgb(218, 143, 5, 0.753)'}
    ]
  };

  addEventMock() {
    var driverMock = this.driverService.getDriverById(5).subscribe(
      (item) => (
        console.log("FOUND : " + JSON.stringify(item))
      ));
    console.log("Driver for event : " + driverMock)
    var eventMock = new Evenement();
    eventMock.startHour = "2020-12-12T10:30:00";
    eventMock.endHour = "2020-12-12T11:30:00";
    eventMock.title = "Mon Titre"
  }

  addEvent() {
      var eventMock = {
        backgroundColor:'yellow',
      title: 'event test',
      start: '2020-12-14T10:30:00',
      end: '2020-12-14T11:30:00',
      extendedProps: {
        department: 'Test'
      },
      description: 'Test Ajout'
    }

    //this.calendarComponent.getApi().addEvent(eventMock);

    //alert('Great. Now, update your database...');
  }

  handleDateClick(arg) {
    alert('date click! ' + arg.dateStr)
  }

  //Forms
  initForm() {
    this.eventForm = new FormGroup({
      driver: new FormControl(null, Validators.required),
      patient: new FormControl(null, Validators.required),
      date: new FormControl(null),
      startHour: new FormControl(null),
      endHour: new FormControl(null),
      journey: new FormControl(null),
    })
  }

  onSubmit() {
    console.log(this.eventForm);

    this.driverService.getDriverById(parseInt(this.selectedDriverId)).subscribe(
      (item) => { this.selectedDriver = item });
      console.log("DRIVER SELECTED : " + JSON.stringify(this.selectedDriver))

    this.patientService.getPatientById(parseInt(this.selectedPatientId)).subscribe(
      (item) => { this.selectedPatient = item });
      console.log("PATIENT SELECTED : " + JSON.stringify(this.selectedPatient))

      console.log("Date value " + this.eventForm.get('date').value);
      console.log("start hour value " + this.eventForm.get('startHour').value);
      console.log("end hour value " + this.eventForm.get('endHour').value);
      console.log("Journey value " + this.eventForm.get('journey').value);

      var eventToAddToDB  = new Evenement();
      eventToAddToDB.title=this.selectedPatient.firstname + " " + this.selectedPatient.lastname.toUpperCase;
      eventToAddToDB.patient = this.selectedPatient;
      eventToAddToDB.driver=this.selectedDriver
      eventToAddToDB.date = this.eventForm.get('date').value
      eventToAddToDB.startPoint = this.eventForm.get('startPoint').value
      eventToAddToDB.endPoint = this.eventForm.get('endPoint').value
      eventToAddToDB.startHour = this.eventForm.get('startHour').value
      eventToAddToDB.endHour = this.eventForm.get('endHour').value

      console.log("Event to add : " + JSON.stringify(eventToAddToDB))

  }
  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification de conducteur', message, 'success')
  }

  errorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout',
      text: 'Quelque chose s\'est mal passé!',
      footer: '<a href>Contacter le service</a>'
    })
  }

  clearDriverForm() {
    this.eventForm.reset();
    this.displayForm = false;
  }

  //Ajouter un conducteur
  displayEventForm() {
    this.displayForm = !this.displayForm;
  }



}
