import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { CalendarOptions, FullCalendarComponent, Calendar } from '@fullcalendar/angular'; // useful for typechecking
import { Evenement } from '../core/models/evenement.schema';
import { EventService } from '../core/services/app/event.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Driver } from '../core/models/driver.schema';
import { DriverService } from '../core/services/app/driver.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { PatientService } from '../core/services/app/patient.service';
import { Patient } from '../core/models/patient.schema';
import { PlaceService } from '../core/services/app/place.service';
import { Place } from '../core/models/place.schema';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
@Component({
  selector: 'app-advanced',
  templateUrl: './advanced.component.html',
  styleUrls: ['./advanced.component.scss']
})
export class AdvancedComponent implements OnInit {

  eventList: Evenement[];
  driverList: Driver[];
  patientList: Patient[];
  placeList: Place[];
  displayForm = true;
  updateEvent = false;
  eventForm: FormGroup
  displayEventClickedDetails = false
  daysArray = []
  startHourSelected: string

  //Form
  newEvent = false;
  recurringValues = [];

  selectedStartPointId: string
  selectedStarPoint: Place
  selectedEndPoint: Place
  selectedEndPointId: string
  selectedDriverId: string
  selectedDriver: Driver
  selectedPatientId: string
  selectedPatient: Patient
  dateSelected: string
  eventListToDisplay = []

  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  ngAfterViewInit(): void {
    this.eventList.forEach((item) => {
    })

  }

  constructor(private eventService: EventService, private driverService: DriverService, private patientService: PatientService, private placeService: PlaceService) { }

  ngOnInit(): void {
    registerLocaleData(localeFr, 'fr');
    this.initForm();
    this.eventService.getEvents().subscribe((items) => (this.eventList = items));

    this.driverService.getDrivers().subscribe((items) => {
      this.driverList = items
    });
    this.patientService.getPatients().subscribe((items) => {
      this.patientList = items
    });
    this.placeService.getPlaces().subscribe((items) => {
      this.placeList = items
    });
  }

  onPrint() {
    window.print();
  }

  //Forms
  initForm() {
    this.eventForm = new FormGroup({
      id: new FormControl(),
      driver: new FormControl(null, Validators.required),
      patient: new FormControl(null, Validators.required),
      date: new FormControl(null),
      startPoint: new FormControl(null, Validators.required),
      startHour: new FormControl(null),
      endPoint: new FormControl(null, Validators.required),
      endHour: new FormControl(null),
    })
  }

  onSubmit() {
    console.log("Event list : " + JSON.stringify(this.eventListToDisplay))
  
    console.log("Submit NEW EVENt")
    if (this.recurringValues != []) {
      //Add each element to BDD
      this.eventListToDisplay.forEach(element => {
        element.title = element.patient.firstname + " " + element.patient.lastname.toUpperCase();

        //Add it to database
        this.addEventToDB(element);
      });
      this.alertWithSuccess('Les évènements ont été ajouté avec succès')

    } else {
      //Display an error message
      this.errorAlert()
    }

  }

  addEventToDB(eventToAddToDB) {
    this.eventService.addEvent(eventToAddToDB).subscribe(
      (events) => {
        this.eventList = events
        this.clearEventForm()
        this.displayForm = false;
      },
      (error) => this.errorAlert()
    );
  }

  alertWithSuccess(message) {
    Swal.fire('Ajout d\'évènement(s)', message, 'success')
  }

  errorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout d\'un ou plusieurs évènement(s)',
      text: 'Quelque chose s\'est mal passé!',
      footer: '<a href>Contacter le service</a>'
    })
  }

  clearEventForm() {
    this.eventForm.reset();
    this.displayForm = false;
  }

  getCheckboxValue(event) {
    if (event.target.value == 7) {
      if (event.target.checked) {
        this.recurringValues = [0, 1, 2, 3, 4, 5, 6]
      } else {
        this.recurringValues = []
      }
    } else {
      //console.log("NOT ALL DAY")
      if (this.recurringValues.includes(parseInt(event.target.value))) {
        if (!event.target.checked) {
          //console.log("Remove item")
          this.removeReccuringValue(parseInt(event.target.value))
        }
      } else {
        if (event.target.checked) {
          //console.log("Addin item")
          this.recurringValues.push(parseInt(event.target.value))
        }
      }
    }
    this.updateDaysArray()
    //console.log("Array : " + this.recurringValues.toString())
  }

  updateDaysArray() {
    this.daysArray = []
    this.eventListToDisplay = []

    this.recurringValues.forEach((element) => {

      this.getNextDayDateForRecurrence(element).forEach(date => {
        var eventToAddToDB = new Evenement();
       
        eventToAddToDB.startHour = this.eventForm.get('startHour').value
        eventToAddToDB.endHour = this.eventForm.get('endHour').value
        console.log("element : " + element)
        eventToAddToDB.date = date;
        this.eventListToDisplay.push(eventToAddToDB)
        console.log("Event to display list : " + JSON.stringify(eventToAddToDB))

         //add driver, patient, title (from patient), start and end point to add it to datab
         this.driverService.getDriverById(parseInt(this.selectedDriverId)).subscribe(
          (item) => { eventToAddToDB.driver = item });
        this.patientService.getPatientById(parseInt(this.selectedPatientId)).subscribe(
          (item) => { eventToAddToDB.patient = item });
        this.placeService.getPlaceById(parseInt(this.selectedStartPointId)).subscribe(
          (item) => { eventToAddToDB.startPoint = item });
        this.placeService.getPlaceById(parseInt(this.selectedEndPointId)).subscribe(
          (item) => { eventToAddToDB.endPoint = item });
      });
      //eventToAddToDB.date = this.getNextDayDateForRecurrence(element);

      console.log("liste : " + JSON.stringify(this.eventListToDisplay))

      if (element == 0) {
        this.daysArray.push("Dimanche")
      } else if (element == 1) {
        this.daysArray.push("Lundi")
      } else if (element == 2) {
        this.daysArray.push("Mardi")
      } else if (element == 3) {
        this.daysArray.push("Mercredi")
      } else if (element == 4) {
        this.daysArray.push("Jeudi")
      } else if (element == 5) {
        this.daysArray.push("Vendredi")
      } else if (element == 6) {
        this.daysArray.push("Samedi")
      } else if (element == 7) {
        this.daysArray = ["tous les jours"]
      }
    })

  }

  removeReccuringValue(dayToRemove) {
    this.recurringValues.forEach((item, index) => {
      if (item === dayToRemove) this.recurringValues.splice(index, 1);
    });
  }

  getNextDayDateForRecurrence(dayNumber) { //0: sunday, 1: monday etc
    var d = new Date();
    var d1 = new Date();
    var zeroString = ""
    
    d.setDate(d.getDate() + (dayNumber + 7 - d.getDay()) % 7);
    if(d.getMonth()<10){
      zeroString = "0"
    } else {
      zeroString = ""
    }
    var date = d.getFullYear() + "-" + zeroString + (d.getMonth() + 1) + "-" + d.getDate()
    console.log("Date : " + date)
    var dateList = []
    dateList.push(date)

    //Same date 1 week later
    d1.setDate(d.getDate() + 7)
    if(d1.getMonth()<10){
      zeroString = "0"
    } else {
      zeroString = ""
    }
    var date1weekLater = d1.getFullYear() + "-" + zeroString + (d1.getMonth() + 1) + "-" + d1.getDate()
    dateList.push(date1weekLater)
    console.log("DATE LISTE SUR DEUX SEMAINES : " + JSON.stringify(dateList))

    return dateList;
  }

}