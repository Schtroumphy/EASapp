import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MenuItem } from '../utils/menu-item';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent implements OnInit {

  menuItems: MenuItem[] = [
    {
      label: 'Accueil',
      icon: 'home',
      redirection : './home'
    },
    {
      label: 'Données',
      icon: 'data_usage',
      redirection : './data'
    },
    {
      label: 'Planning',
      icon: 'calendar_today',
      redirection : './calendar'
    },
    {
      label: 'Avancés',
      icon: 'settings',
      redirection : './advanced'
    }
  ];

  constructor(private router : Router) { }

  ngOnInit(): void {
    //let currentUrl = this.router.url;
    //console.log("IN BOTTOM NAV CURRENT URL : ", currentUrl )
  }

  alertWithWarning() {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Souhaitez-vous vous déconnecter ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, sûr',
      cancelButtonText: 'Non, je reste'
    }).then((result) => {
      if (result.value) {
        this.router.navigateByUrl('/auth')
      }
    })
  }

}
