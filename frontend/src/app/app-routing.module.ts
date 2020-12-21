import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResetpasswordComponent } from './components/resetpassword/resetpassword.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AuthGuard } from './shared/auth.guard';

// const routes: Routes = [];
const routes: Routes = [
  { path: '', 
    redirectTo: '/log-in', 
    pathMatch: 'full' 
  },
  { 
    path: 'log-in', 
    component: SigninComponent 
  },
  { 
    path: 'sign-up', 
    component: SignupComponent 
  },
  { 
    path: 'user-profile/:id', 
    component: UserProfileComponent, canActivate: [AuthGuard] 
  },
  { 
    path: 'reset-password', 
    component: ResetpasswordComponent
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
