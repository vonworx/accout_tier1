'use strict';

import { addressChangePermissionDenied } from './address-change';
import { ForbiddenException } from '@nestjs/common';

describe( 'addressChangePermissionDeniedHandler', () => {
    beforeAll( () => {} );

    beforeEach( () => {} );

    afterEach( () => {} );

    describe('error response', () => {
        test('redirect Shopper', () => {
            const addressChangePermissionDeniedFault = require( '../../../tests/fixtures/member/save-address-permission-denied-fault.json' );
            const result = addressChangePermissionDenied(addressChangePermissionDeniedFault);
            expect( result ).toBeInstanceOf( ForbiddenException );
        });
    });
} );
