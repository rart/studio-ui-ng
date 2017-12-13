import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar } from '@angular/material';
import { ComponentType } from '@angular/cdk/portal';
import { TemplateRef } from '@angular/core';

// MatSnackBarHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
// MatSnackBarVerticalPosition = 'top' | 'bottom';
export const showSnackBar = (snackBarModule: MatSnackBar, message: string, action?, options?) => {
  let opts = Object.assign({
    horizontalPosition: 'center',
    verticalPosition: 'top',
    duration: 6000
  }, options || {});
  return snackBarModule.open(message, action, opts);
};

export const openDialog = <T>(dialogModule: MatDialog,
                              compOrTemplate: ComponentType<T> | TemplateRef<T>,
                              config?: MatDialogConfig): MatDialogRef<T> => {
  return dialogModule.open(compOrTemplate, config);
};
