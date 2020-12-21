import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from './../../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})

export class SigninComponent implements OnInit {
  signinForm: FormGroup;
  submitted = false;
  forgotClicked = false;

  constructor(
    public fb: FormBuilder,
    public authService: AuthService,
    public router: Router
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  }
  ngOnInit() { }
  get f() { return this.signinForm.controls; }

  forgotPassword() {
    this.forgotClicked = true;
    this.authService.sendForgotMail(this.signinForm.value);
    console.log("done");

  }
  onReset() {
    this.submitted = false;
    this.signinForm.reset;
  }
  loginUser() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.signinForm.invalid) {
        return;
    }
    this.authService.signIn(this.signinForm.value)
  }
}