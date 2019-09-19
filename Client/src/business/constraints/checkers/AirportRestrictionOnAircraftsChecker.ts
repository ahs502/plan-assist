import Checker from 'src/business/constraints/Checker';
import Objection from 'src/business/constraints/Objection';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { Constraint } from '@core/master-data';
import { AirportRestrictionOnAircraftsConstraintData } from '@core/master-data/Constraint';

export default class AirportRestrictionOnAircraftsChecker extends Checker {
  private data: AirportRestrictionOnAircraftsConstraintData;

  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraint: Constraint) {
    super(preplan, constraintSystem, constraint.template, constraint);
    this.data = constraint.data as AirportRestrictionOnAircraftsConstraintData;
  }

  check(): Objection[] {
    return []; //TODO: Not implemented.
  }
}
