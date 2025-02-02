import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AgentInfoModel } from '@modules/auth/models';
import { AuthService } from '@modules/auth/services';
import { DropDownModel, SmsModel } from '@shareds/models';
import { CommonService } from '@shareds/services';
import { ResponseModel } from 'dpk-core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agent-info',
  templateUrl: './agent-info.component.html',
  styleUrls: ['./agent-info.component.css'],
})
export class AgentInfoComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
  agentInfoModel: AgentInfoModel = new AgentInfoModel();
  agentForm: FormGroup;
  disableSubmitButton: boolean = true;
  branches: DropDownModel[];
  token: string = '';
  loadingSubmitBtn: boolean = false;

  constructor(
    private commonService: CommonService,
    private service: AuthService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.getAgentInfoData();
  }

  /**
   * دریافت دیتا اطلاعات مشتری از common
   */
  getAgentInfoData() {
    this.subscription = this.commonService.getAgentInfo(
      (res: AgentInfoModel) => {
        this.token = res.token;
        //اگه صفحه رفرش شد برگرده صفحه قبل
        res.token ? this.setAgentForm(res) : this.router.navigate(['/auth']);
      }
    );
  }

  /**
   * در صورت وجود نداشتن مشتری باید اطلاعات پر شود
   */
  setAgentForm(res: AgentInfoModel) {
    this.agentInfoModel = res;
    this.branches = res.branches as DropDownModel[];
    this.agentForm = new FormGroup({
      name: new FormControl(res.name, [
        Validators.required,
        Validators.maxLength(30),
        Validators.minLength(2),
        Validators.pattern(
          '^[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F ]+$'
        ),
      ]),
      lastName: new FormControl(res.lastName, [
        Validators.required,
        Validators.maxLength(70),
        Validators.minLength(2),
        Validators.pattern(
          '^[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F ]+$'
        ),
      ]),
      mobile: new FormControl(res.mobile, [
        Validators.required,
        Validators.minLength(11),
        Validators.pattern(
          '(0)?([ ]|-|[()]){0,2}9[1|2|3|9|0|]([ ]|-|[()]){0,2}(?:[0-9]([ ]|-|[()]){0,2}){8}'
        ),
      ]),
      legalEmail: new FormControl(res.legalEmail, [Validators.required]),
      agentEmail: new FormControl(res.agentEmail),
      branchId: new FormControl(res.branchId, [Validators.required]),
      token: new FormControl(res.token),
    });
    if (res.operationMode != 'back') {
      this.disableFormDefaultValue();
    }
  }

  /**
   * در صورت داشتن مقدار در یکی از فیلدها، غیرفعال شود
   */
  disableFormDefaultValue() {
    const formFields = [
      'name',
      'lastName',
      'agentEmail',
      'legalEmail',
      'branchId',
    ];
    for (const field of formFields) {
      if (this.agentInfoModel[field]) {
        this.disableAgentForm(field);
      }
    }
  }

  /**
   * غیرفعال کردن فیلد
   * @param controlName نام فیلد
   */
  disableAgentForm(controlName: string) {
    this.agentForm.controls[controlName].disable();
  }

  /**
   * انتقال به صفحه تایید موبایل
   */
  onRouteToConfirmMobile() {
    var agentInfo = this.agentForm.value;
    this.commonService.setAgentInfo({
      name: this.agentForm.controls['name'].value,
      lastName: this.agentForm.controls['lastName'].value,
      mobile: this.agentForm.controls['mobile'].value,
      agentEmail: agentInfo.agentEmail,
      legalEmail: agentInfo.legalEmail,
      token: agentInfo.token,
      branchId: agentInfo.branchId,
      branches: this.branches,
    });
    this.router.navigate(['auth/register/confirm-mobile']);
  }

  /**
   * ثبت اطلاعات نماینده
   */
  onSubmit() {
    this.loadingSubmitBtn = true;
    var req = this.setReqRegisterInfo();
    this.setAgentInfoCommon(req);
    this.service.registerAgentInfo(req).subscribe(
      (res: ResponseModel<SmsModel>) => {
        this.commonService.setSmsModel(res.result as SmsModel);
        this.onRouteToConfirmMobile();
        this.loadingSubmitBtn = false;
      },
      (err) => {
        this.loadingSubmitBtn = false;
      }
    );
  }

  /**
   * ذخیره اطلاعات نماینده در CommonService
   * @param req
   */
  setAgentInfoCommon(req: AgentInfoModel) {
    var branchName = this.branches.find((d) => d.id == req.branchId)?.title;
    this.commonService.setAuthorityInfo({
      branchName: branchName,
      name: req.name,
      lastName: req.lastName,
    });
  }

  /**
   *
   * @returns ایجاد مدل ریکوئست اطلاعات نماینده
   */
  setReqRegisterInfo() {
    var req: AgentInfoModel = {
      name: this.agentForm.controls['name'].value,
      lastName: this.agentForm.controls['lastName'].value,
      agentEmail: this.agentForm.controls['agentEmail'].value,
      legalEmail: this.agentForm.controls['legalEmail'].value,
      mobile: this.agentForm.controls['mobile'].value,
      branchId: this.agentForm.controls['branchId'].value,
      token: this.token,
    };
    return req;
  }

  /**
   * انتقال به صفحه ثبت نام
   */
  onRouteToRegister() {
    this.router.navigate(['auth/register/init-register']);
  }
}
