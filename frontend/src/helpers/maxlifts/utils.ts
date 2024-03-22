import { MaxLiftType } from 'src/helpers/maxlifts/maxlift';

/**
 * Get MaxLift measurement unit.
 *
 * @param type maxlift type.
 * @returns measurement unit.
 */
export function getMaxliftUnit(type: MaxLiftType | any) {
  switch (type) {
    case MaxLiftType._1RM:
    case MaxLiftType._3RM:
    case MaxLiftType._5RM:
    case MaxLiftType._6RM:
    case MaxLiftType._8RM:
    case MaxLiftType._10RM:
      return 'kg';
    case MaxLiftType._maxrep:
      return 'reps';
    case MaxLiftType._maxtime:
      return 's';
    default:
      return '';
  }
}
