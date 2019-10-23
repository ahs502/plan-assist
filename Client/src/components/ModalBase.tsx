import React, { FC, ReactElement } from 'react';
import { Theme, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import DraggableDialog, { DraggableDialogProps } from 'src/components/DraggableDialog';

const useStyles = makeStyles((theme: Theme) => ({
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  disable: {
    opacity: 0.5
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  marginTop2: {
    marginTop: theme.spacing(2)
  },
  error: {
    padding: theme.spacing(1.5, 1.5, 1.5, 3)
  },
  paperError: {
    boxShadow: '0px 1px 3px 0px rgba(255, 0, 0, 0.2), 0px 1px 1px 0px rgba(255, 0, 0, 0.14), 0px 2px 1px -1px rgba(255, 0, 0, 0.12)'
  }
}));

export interface ModalBaseProps extends DraggableDialogProps {
  open: boolean;
  loading?: boolean;
  complexTitle?: ReactElement;
  cancelable?: boolean;
  errorMessage?: string;
  onClose?(): void;
  actions: ModalAction[];
}

export interface ModalAction {
  title: string;
  action?(): void;
}

const ModalBase: FC<ModalBaseProps> = ({ children, loading, title, complexTitle, cancelable, errorMessage, onClose, actions, ...other }) => {
  if (cancelable && !onClose) throw 'Cancelable ModalBases need onClose handler to be defined.';

  const classes = useStyles();

  return (
    <DraggableDialog {...other} aria-labelledby="form-dialog-title" disableBackdropClick={loading || !cancelable} disableEscapeKeyDown={loading || !cancelable} onClose={onClose}>
      <DialogTitle className={loading ? classes.disable : ''} id="form-dialog-title">
        {title ? title : complexTitle}
      </DialogTitle>
      <DialogContent>
        <div className={classNames(loading ? classes.disable : '')}>{children}</div>
        {loading && <CircularProgress size={24} className={classes.progress} />}
        {errorMessage && (
          <Paper className={classNames(classes.paperError, classes.marginTop2)}>
            <Typography className={classes.error} component="p" variant="body1" color="error">
              {errorMessage}
            </Typography>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={() => {
              const handler = action.action || onClose;
              handler && handler();
            }}
            disabled={loading}
            color="primary"
          >
            {action.title}
          </Button>
        ))}
      </DialogActions>
    </DraggableDialog>
  );
};
export default ModalBase;