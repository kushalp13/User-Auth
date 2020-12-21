import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';
import { MustMatch } from 'src/app/shared/must-match.validator';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {

  public token:any;
  resetForm:FormGroup;
  submitted = false;
  reset = false;
  constructor(
    public actRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    public fb: FormBuilder
  ) { 
    this.token = this.actRoute.snapshot.queryParamMap.get('token');
    this.resetForm = this.fb.group({
      password: ['',[Validators.required, Validators.minLength(5), Validators.maxLength(8)]],
      confirmPassword: ['',Validators.required]
    },{
      validator: MustMatch('password', 'confirmPassword')
    })
  }

  onSubmit() {
    this.submitted = true;
    if(this.resetForm.invalid) {
      return;
    }
    const obj = {
      newpass: this.resetForm.value.password,
      repass: this.resetForm.value.confirmPassword,
      token: this.token
    }
    this.authService.resetPassword(obj);
    this.resetForm.reset();
    this.router.navigate(['/log-in']);
    this.reset = true;
  }
  get f() { return this.resetForm.controls; }
  onReset() {
    this.submitted = false;
    this.resetForm.reset();
  }
  ngOnInit(): void {
  }

}
