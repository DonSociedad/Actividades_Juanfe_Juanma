import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserRole } from 'src/users/dto/user.dto';

// define possible actions
export enum Action {
  manage = 'manage',
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete',
}

// define rule format
export interface Rule {
  action: Action;
  subject: String;
  conditions?: any;
  fields?: string[];
  inverted?: boolean;
}

// define abilities container
export interface Ability {
  rules: Rule[];
}

@Injectable()
export class AbilityFactory {
  defineAbilitiesFor(user: any): Ability {
    const rules: Rule[] = [];

    if (user) {
      const userId = user._id || user.id;
      rules.push({
        action: Action.read,
        subject: 'all',
      });

      rules.push({
        action: Action.create,
        subject: 'Product',
      });

      rules.push({
        action: Action.update,
        subject: 'Product',
        conditions: { createdBy: userId },
      });

      rules.push({
        action: Action.delete,
        subject: 'Product',
        conditions: { createdBy: userId },
      });
    }

    if (user?.role === UserRole.ADMIN) {
      rules.push({
        action: Action.manage,
        subject: 'all',
      });
    }

    return {
      rules,
    };
  }
  can(ability: Ability, action: Action, subject: String, data?: any): boolean {
    if (!ability || !ability.rules) {
      return false;
    }
    const manageRule = ability.rules.find(
      (rule) =>
        rule.action === Action.manage &&
        (rule.subject === 'all' || rule.subject === subject),
    );
    if (manageRule) {
      return true;
    }
    const rules = ability.rules.filter(
      (rule) =>
        (rule.action === action || rule.action === Action.manage) &&
        (rule.subject === 'all' || rule.subject === subject),
    );

    if (rules.length === 0) {
      return false;
    }

    return rules.some((rule) => {
      if (!rule.conditions) {
        return true;
      }

      return Object.entries(rule.conditions).every(([key, value]) => {
        if (data && data[key] && value) {
          const dataValue =
            data[key] instanceof Types.ObjectId
              ? data[key].toString()
              : data[key];
          const condValue =
            value instanceof Types.ObjectId ? value.toString() : value;

          return dataValue === condValue;
        }
        return false;
      });
    });
  }
}
