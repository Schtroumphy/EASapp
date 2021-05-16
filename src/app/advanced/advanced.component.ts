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
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { DAYS, FORMAT_yyyy_dd_MM, FORMAT_yyyy_MM_dd } from '../core/constants';
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
  updateEvent = false;
  eventForm: FormGroup
  displayEventClickedDetails = false
  daysArray = []
  startHourSelected: string

  duplicateForm : FormGroup
  eventsToDuplicateForNextWeek : Evenement[]
  eventsDuplicated: Evenement[]
  maxDate : string
  allowDuplication : boolean = false
  showNoEventsError : boolean = false

  planDriverForm : FormGroup

  //Form
  newEvent = false;
  recurringValues = [];
  displayPlanDriver: boolean = false;
  isDisabledAM: boolean = false;
  isDisabledPM: boolean = false;
  isDisabledAllDay: boolean = false;
  startHourPlanSelected: string;
  endHourPlanSelected: string;
  selectedDatePlan: string;
  eventPlanList = []
  displaySaveButton: boolean = false
  checklist = []
  checkedlist = []

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
  displayForm: boolean;
  displayDuplicateForm : boolean;

  //periodIdSelected: number;
  selectedPlanDriverId: string;
  intervalsHour = [];
  hours_job: string[] = [];
  hours_job_from: string[] = [];

  constructor(private eventService: EventService, private driverService: DriverService, private patientService: PatientService, private placeService: PlaceService, private datePipe: DatePipe) {
    this.checklist = [
      { id: 1, label: 'Lundi', isSelected: false },
      { id: 2, label: 'Mardi', isSelected: false },
      { id: 3, label: 'Mercredi', isSelected: false },
      { id: 4, label: 'Jeudi', isSelected: false },
      { id: 5, label: 'Vendredi', isSelected: false },
      { id: 6, label: 'Samedi', isSelected: false },
      { id: 0, label: 'Dimanche', isSelected: false },
      { id: 7, label: 'Tous les jours', isSelected: false },
    ];
  }

  ngOnInit(): void {
    registerLocaleData(localeFr, 'fr');
    this.initForms();
    //this.eventService.getEvents().subscribe((items) => (this.eventList = items));

    this.driverService.getDrivers().subscribe((items) => {
      this.driverList = items
    });
    this.patientService.getPatients().subscribe((items) => {
      this.patientList = items
    });
    this.placeService.getPlaces().subscribe((items) => {
      this.placeList = items
    });
    this.hours_job = Array.from(Array(23).keys()).map(x => {
      if (x < 10) {
        return "0" + x
      } else {
        return "" + x
      }
    }).filter(x => parseInt(x) > 7 && parseInt(x) < 23)
  }

  onPrint() {
    window.print();
  }

  getEventsBetweenTwoDates(){
    this.eventService.getEventsBetweenTwoDates(this.duplicateForm.get('startDate').value, this.duplicateForm.get('endDate').value).subscribe(
      (events) => {
        //this.eventList = events
        this.eventsToDuplicateForNextWeek = this.sortByDate(events, 'date')
        this.eventsDuplicated = events
        console.log("EVENT TO DUPLICATE BEfore sort by driver : ", JSON.stringify(this.eventsToDuplicateForNextWeek))
        if(this.duplicateForm.get('driver').value != null){
          console.log("SORT BY DRIVER : ", this.duplicateForm.get('driver').value)
          this.driverService.getDriverById(parseInt(this.selectedDriverId)).subscribe(
            (item) => { 
              console.log("Selected driver ",JSON.stringify(item))
              this.eventsToDuplicateForNextWeek = this.eventsToDuplicateForNextWeek.filter(
                event => event.driver.id === item.id);
              this.eventsDuplicated = this.eventsToDuplicateForNextWeek
            });
            console.log("EVENT TO DUPLIACTE : ", JSON.stringify(this.eventsToDuplicateForNextWeek))
        }
        //Display events
      },
      (error) => this.errorAlert()
    );
    this.allowDuplication = this.eventsToDuplicateForNextWeek.length > 0
    this.showNoEventsError = this.eventsToDuplicateForNextWeek.length == 0
  }

  displayDuplicatePlanningForm(){
    this.displayPlanningDuplicateForm()
  }

  onSubmitDuplicateForm(){
    console.log("Submit duplicate")
    if (this.eventsDuplicated != []) {
      //Add each element to BDD
      this.eventsDuplicated.forEach(element => {
        element.id = 0 // For new id
        element.date = this.datePipe.transform(this.addDays(new Date(element.date), 7), FORMAT_yyyy_MM_dd).toString()

        //Add it to database
        this.addEventToDB(element);
      });
      this.alertSuccessDuplication()
    } else {
      //Display an error message
      this.errorAlert()
    }
    console.log("Event list duplicated : " + JSON.stringify(this.eventsDuplicated))
    console.log("Event list  : " + JSON.stringify(this.eventsToDuplicateForNextWeek))
  }
  
  clearPlanDriverForm(){
    console.log("CLEAR PLAN DRIVER FORM")
    this.planDriverForm.reset()
    this.displaySaveButton = false
    this.intervalsHour = []
    this.displayPlanDriver = false
  }

  clearDuplicateForm(){
    console.log("CLEAR DUPLICATE FORM")
    this.duplicateForm.reset();
    this.displayDuplicateForm = false;
    this.eventsToDuplicateForNextWeek = []
    this.eventsDuplicated = []
  }

  sortByDate(events : Evenement[], prop: string) : Evenement[]{
    return events.sort((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }

  //Forms
  initForms() {
    this.eventForm = new FormGroup({
      id: new FormControl(),
      driver: new FormControl(null, Validators.required),
      patient: new FormControl(null, Validators.required),
      date: new FormControl(null, Validators.required),
      startPoint: new FormControl(null, Validators.required),
      startHour: new FormControl(null, Validators.required),
      endPoint: new FormControl(null, Validators.required),
      endHour: new FormControl(null, Validators.required),
    })

    this.duplicateForm = new FormGroup({
      id: new FormControl(),
      driver: new FormControl(null),
      startDate: new FormControl(null),
      endDate: new FormControl(null, Validators.required),
    })

    this.planDriverForm = new FormGroup({
      id: new FormControl(),
      driver: new FormControl(null, Validators.required),
      date : new FormControl(null, Validators.required),
      startHour: new FormControl(null, Validators.required),
      endHour: new FormControl(null, Validators.required),
    })
  }

  startDatePeriodChanged(){
    console.log("START DATE CHANGED : ", this.duplicateForm.get('startDate').value)
    console.log(new Date(this.duplicateForm.get('startDate').value))
    this.maxDate = this.datePipe.transform(this.addDays(new Date(this.duplicateForm.get('startDate').value), 6), FORMAT_yyyy_MM_dd).toString()
    console.log("MAX DATE : ", this.maxDate)
  }

  addDays(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
}

  onSubmit() {
    console.log("Event list : " + JSON.stringify(this.eventListToDisplay))

    console.log("Submit NEW EVENt")
    if (this.eventListToDisplay != []) {
      //Add each element to BDD
      this
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
    console.log("CLEAR EVENT FORM")
    this.eventForm.reset();
    this.displayForm = false;
    this.checkedlist = []
  }

  updateCheckedList(event) {
    console.log("change check " + JSON.stringify(event))
    if (event.target.value == 7) {
      console.log("uncheck all ")

      this.checklist.filter(check => check.id != 7).forEach(check =>{ check.isSelected = event.target.checked ? true : false})
    } else {
      this.checklist[this.checklist.findIndex(check => check.id == event.target.value)].isSelected = event.target.checked ? true : false
      console.log("New checklist " + JSON.stringify(this.checklist))
    }
    this.checkedlist = this.checklist.filter(check => check.isSelected && check.id != 7)
    console.log("change checked list" + JSON.stringify(this.checkedlist))
    this.updateRecurringEventList()
  }

  //Display form to add event
  displayEventForm() {
    this.displayForm = !this.displayForm;
    this.displayPlanDriver = false;
    this.displayDuplicateForm = false;
  }

  updateRecurringEventList(){
    this.eventListToDisplay = []
    this.checkedlist.forEach((day) =>{
      this.getNextDayDateForRecurrence(this.eventForm.get("date").value, day.id).forEach(date => {

        var eventToAddToDB = new Evenement();

        eventToAddToDB.startHour = this.eventForm.get('startHour').value
        eventToAddToDB.endHour = this.eventForm.get('endHour').value
        console.log("element : " + day.id)
        eventToAddToDB.date = this.datePipe.transform(date, FORMAT_yyyy_dd_MM);
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

    })
  }

  updateDaysArray() {
    this.daysArray = []
    this.eventListToDisplay = []

    console.log("Date selected " + this.eventForm.get("date").value)
    console.log("Recrring values " + JSON.stringify(this.recurringValues))
    this.recurringValues.forEach((element) => {

      this.getNextDayDateForRecurrence(this.eventForm.get("date").value, element).forEach(date => {

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
    })
  }

  removeReccuringValue(dayToRemove) {
    this.recurringValues.forEach((item, index) => {
      if (item === dayToRemove) this.recurringValues.splice(index, 1);
    });
  }

  getNextDayDateForRecurrence(firstDate, dayNumber) { //0: sunday, 1: monday etc
    console.log("Date selcted : " + JSON.stringify(firstDate))
    var d = new Date(firstDate);
    var d1 = new Date(firstDate);
    var zeroString = ""
    console.log("Date selcted convert to date: " + JSON.stringify(d))

    console.log("Get date : " + JSON.stringify(d.getDate()))
    console.log("Day number : " + dayNumber)
    console.log("Get day : " + JSON.stringify(d.getDay()))
    console.log("RESULT " + d.getDate() + (dayNumber + 7 - d.getDay()) % 7)

    d.setDate(d.getDate() + (dayNumber + 7 - d.getDay()) % 7)

    console.log("D after set date : " + d)
    console.log("D after set date : " + JSON.stringify(d))

    console.log("Date selcted convert w/ format: " + JSON.stringify(d))
    var date = this.datePipe.transform(d, FORMAT_yyyy_dd_MM)
    console.log("Date selcted convert w/ format: " + JSON.stringify(date))

    if (d.getMonth() < 10) {
      zeroString = "0"
    } else {
      zeroString = ""
    }

    //var date = d.getFullYear() + "-" + zeroString + (d.getMonth() + 1) + "-" + d.getDate()
    console.log("Date : " + date)
    var dateList = []
    dateList.push(date)

    //Same date 1 week later
    d1.setDate(d.getDate() + 7)
    if (d1.getMonth() < 10) {
      zeroString = "0"
    } else {
      zeroString = ""
    }
    var date1weekLater = d1.getFullYear() + "-" + zeroString + (d1.getMonth() + 1) + "-" + d1.getDate()
    dateList.push(date1weekLater)
    console.log("DATE LISTE SUR DEUX SEMAINES : " + JSON.stringify(dateList))

    return dateList;
  }

  displayPlanForm() {
    //console.log(" HOUR JOB " + JSON.stringify(this.hours_job))
    this.createHalfHourIntervals(8, 12) //Morning
    this.displayPlanDriver = !this.displayPlanDriver
    this.displayForm = false;
    this.displayDuplicateForm = false
  }

  displayPlanningDuplicateForm() {
    //console.log(" HOUR JOB " + JSON.stringify(this.hours_job))
    this.displayPlanDriver = false
    this.displayForm = false;
    this.displayDuplicateForm = true
  }

  planDriver() {
    this.displaySaveButton = true;
    this.displayPlanDriver = true;
    this.eventPlanList = []
    console.log("Date selected : " + this.selectedDatePlan)
    console.log("Driver selected : " + this.selectedPlanDriverId)
    //console.log("Period selected : " + this.periodIdSelected)
    console.log("Period start selected : " + this.startHourPlanSelected)
    console.log("Period end selected : " + this.endHourPlanSelected)
    var from, until;
    from = parseInt(this.startHourPlanSelected)
    until = parseInt(this.endHourPlanSelected)
    var driverPlan;
    this.driverService.getDriverById(parseInt(this.selectedPlanDriverId)).subscribe((item) => {
      driverPlan = item
    });

    var startHour, endHour;
    this.intervalsHour = this.createHalfHourIntervals(from, until)
    this.intervalsHour.forEach((interval) => {
      startHour = interval[0]
      endHour = interval[1]
      console.log("START HOUR TRANS : " + JSON.stringify(startHour))
      console.log("END HOUR TRANS : " + JSON.stringify(endHour))

      //console.log(JSON.stringify(interval))
      var eventPlan = new Evenement()
      eventPlan.date = this.selectedDatePlan
      eventPlan.driver = driverPlan
      eventPlan.patient = null
      eventPlan.startPoint = null
      eventPlan.startHour = startHour
      eventPlan.endPoint = null
      eventPlan.endHour = endHour
      this.eventPlanList.push(eventPlan)
    })
    console.log("Event plan list : " + JSON.stringify(this.eventPlanList))
  }

  removeInterval(interval) {
    console.log("Remove " + interval)
    this.intervalsHour = this.intervalsHour.filter(e => e !== interval)
    this.eventPlanList = this.eventPlanList.filter(e => e.startHour !== interval[0] && e.endHour !== interval[1])
    console.log("Event plan list : " + JSON.stringify(this.eventPlanList))
  }

  createHalfHourIntervals(from, until) {
    var intervals = [];
    var quarterHours = ["00", "15", "30", "45"];
    for (let i = from; i < until; i++) {
      console.log("i : " + i)
      quarterHours.forEach(quarter => {
        if (i < 10) {
          intervals.push("0" + i + ":" + quarter)
        } else {
          intervals.push(i + ":" + quarter)
        }
        console.log("Intervals " + JSON.stringify(intervals))
      })
    }
    until < 10 ? intervals.push("0" + until + ":00") : intervals.push(until + ":00")

    var intervals2 = []
    var intervalsDef = []

    intervals.forEach((element, i) => {
      if (i == 0)
        intervals2.push(element)
      else {
        intervals2.push(element)
        intervalsDef.push(intervals2)
        intervals2 = []
        intervals2.push(element)
      }
      console.log("Intervals DEf " + JSON.stringify(intervalsDef))
      //console.log("Intervals 2 " + JSON.stringify(intervals2))
    })
    return intervalsDef;
  }

  updateHoursJobFrom() {
    this.hours_job_from = this.hours_job.filter(e => parseInt(e) > parseInt(this.startHourPlanSelected))
  }

  savePatientPlanSelection(hour, index, patientId) {
    console.log("PATIENT PLAN SELECTION")
    console.log("Hour " + JSON.stringify(hour))
    console.log("Index " + index)
    console.log("Patient id " + patientId)
    this.patientService.getPatientById(parseInt(patientId)).subscribe(
      (item) => {
        var foundIndex = this.eventPlanList.findIndex(e => e.startHour == hour[0] && e.endHour == hour[1])
        this.eventPlanList[foundIndex].patient = item
        console.log("Index : " + foundIndex + " | " + JSON.stringify(this.eventPlanList[foundIndex]))
      });
    console.log("Event plan patient " + JSON.stringify(this.eventPlanList.find(e => e.startHour == hour[0] && e.endHour == hour[1])))
  }

  saveStartPointSelection(hour, index, placeId) {
    console.log("START PLAN SELECTION")
    console.log("Hour " + hour)
    console.log("Index " + index)
    console.log("Start Place id " + placeId)
    this.placeService.getPlaceById(parseInt(placeId)).subscribe(
      (item) => {
        var foundIndex = this.eventPlanList.findIndex(e => e.startHour == hour[0] && e.endHour == hour[1])
        this.eventPlanList[foundIndex].startPoint = item
        console.log("Index : " + foundIndex + " | " + JSON.stringify(this.eventPlanList[foundIndex]))
      });
    console.log("Start point plan " + JSON.stringify(this.eventPlanList.find(e => e.startHour == hour[0] && e.endHour == hour[1])))
  }
  saveEndHourSelection(hour, index, placeId) {
    console.log("END PLAN SELECTION")
    console.log("Hour " + hour)
    console.log("Index " + index)
    console.log("End Place id " + placeId)
    this.placeService.getPlaceById(parseInt(placeId)).subscribe(
      (item) => {
        var foundIndex = this.eventPlanList.findIndex(e => e.startHour == hour[0] && e.endHour == hour[1])
        this.eventPlanList[foundIndex].endPoint = item
        console.log("Index : " + foundIndex + " | " + JSON.stringify(this.eventPlanList[foundIndex]))
      });
    console.log("Start point plan " + JSON.stringify(this.eventPlanList.find(e => e.startHour == hour[0] && e.endHour == hour[1])))
  }

  savePlan() {
    console.log("EVENT PLAN AFTER SAVE " + JSON.stringify(this.eventPlanList))
    const emptyCondition = (currentValue) => currentValue.patient == null && currentValue.startPoint == null && currentValue.endPoint == null;

    if (this.eventPlanList.every(emptyCondition)) {
      alert("Aucune modification n'a été détecté")
    } else {
      //Sort complete event and remove incomplete
      console.log("Event plan list before sorting : " + JSON.stringify(this.eventPlanList))
      this.eventPlanList = this.eventPlanList.filter(e => e.patient !== null && e.startPoint !== null && e.endPoint !== null)
      console.log("Event plan list after sorting : " + JSON.stringify(this.eventPlanList))

      if (!this.eventPlanList.length) { // Check if array is empty
        alert("Aucune planification n'est complète (patient et trajet)")
      } else {
        //Save each event
        this.eventPlanList.forEach(element => {
          element.title = element.patient.firstname + " " + element.patient.lastname.toUpperCase();

          //Add it to database
          this.addEventToDB(element);
        });
        this.alertWithSuccess('Les évènements ont été ajouté avec succès')

        //Clear eventPlanList
        this.eventPlanList = []

      }
      this.displaySaveButton = false;

      //Hide plan driver list
      this.displayPlanDriver = false
    }

  }

  alertSuccessDuplication() {
    Swal.fire({
      title: 'Duplication de planning',
      text: 'La duplication a été effectuée. Vous retrouverez votre nouveau planning duppliqué dans l\'onglet "Planning".',
      icon: 'success',
      showCancelButton: false,
      confirmButtonText: 'Ok',
    }).then((result) => {
      if (result.value) {
        this.clearDuplicateForm()
      }
    })
  }

  clearRecurrence() {
    this.recurringValues = []
  }


  uncheckAllCheckbox() {
    this.checklist.forEach(check => {
      if(check.id != 7)
        check.isSelected = false;
    })
  }
}

