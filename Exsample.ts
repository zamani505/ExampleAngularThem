import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'dpk-core/services';
import { ResponseModel } from 'dpk-core/models';
import { ActivityAddModel } from '../../models';
import { ActivityInfoService } from '../../services';
import { Router } from '@angular/router';
import { StaticDatasService } from '@shareds/services';
import { FileDownloadService } from 'dpk-components/custom/dpk-file-manager';
import { Subscription } from 'rxjs';

@Component({
  selector: 'add-activity-info',
  templateUrl: './add-activity-info.component.html',
  styleUrls: ['./add-activity-info.component.css']
})
export class AddActivityInfoComponent implements OnInit, OnDestroy {
  deletedFile: string[] = [];
  loadingSubmitBtn: boolean = false;

  /**subscription */
  public navigateSub: Subscription = new Subscription();

  constructor(private service: ActivityInfoService,
    private messageService: MessageService,
    private router: Router,
    private staticService: StaticDatasService,
    private dmService: FileDownloadService) { }

  ngOnDestroy(): void {
    this.navigateSub.unsubscribe();
  }

  ngOnInit(): void {
  }

  getDeletedFiles(file: string[]) {
    this.deletedFile = [];
    this.deletedFile.push(...file);
  }

  //ثبت فعالیت
  addActivity(model: ActivityAddModel) {
    this.loadingSubmitBtn = true;
    this.service.addActivity(model)
      .subscribe((res: ResponseModel<ActivityAddModel>) => {
        if (this.deletedFile.length > 0) {
          this.dmService.deleteBatchFile(this.deletedFile).subscribe(data => {
            this.doActionsAfterSuccessAdd();
          },
            (err) => {
              this.loadingSubmitBtn = false;
            });
        }
        else this.doActionsAfterSuccessAdd();
      },
        (err) => {
          this.loadingSubmitBtn = false;
        });
  }
  /**
  * بررسی route کاربر
  */
  checkNavigateToPage() {
    this.navigateSub = this.staticService
      .getStage()
      .subscribe((res: ResponseModel<any>) => {
        this.router.navigate([res.result.currentRoute]);
      });
  }
  //عملیات بعد از انجام ثبت
  doActionsAfterSuccessAdd() {
    this.messageService.add({
      severity: 'success',
      detail: 'ثبت اطلاعات نوع فعالیت با موفقیت انجام شد',
    });
    this.loadingSubmitBtn = false;
    this.checkNavigateToPage();
  }
}
