'use strict';

import { BrandType } from '../common/constants/brand.type';

jest.mock('../cart/cart.service');
jest.mock('./_services/membership.service');
jest.mock('../common/dto/store-detail.dto');
jest.mock('./_services/member.service');
import { StoreDetailDto } from '../common/dto/store-detail.dto';
import { MembershipController } from './membership.controller';
import { CartService } from '../cart/cart.service';
import { MembershipService } from './_services/membership.service';
import { MembershipDto, MembershipPeriodDto, MembershipPeriodStatus } from './dto/membership';
import { HeadersDto } from '../common/dto/headers-info.dto';
import { randomIntegerInRange, randomString } from '../../tests/test-helpers';
import { MemberService } from './_services/member.service';
import { CustomerDetailDto, CustomerNmpDetailsDto } from './dto/customer-details.dto';

describe('MembershipController tests', () => {
    let membershipService: MembershipService;
    let cartService: CartService;
    let memberService: MemberService;

    beforeEach(() => {
        membershipService = new MembershipService(null, null);
        cartService = new CartService(null, null, null, null);
        memberService = new MemberService(null, null);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('and getMembership', () => {
        let persona;
        let membershipDto: MembershipDto;
        let periodDto: MembershipPeriodDto;
        let headersDto: HeadersDto;

        beforeEach(() => {
            persona = {personaName: randomString(), personaTagId: randomIntegerInRange(1, 222)};
            membershipDto = new MembershipDto();
            membershipDto.adminFirstName = randomString();

            periodDto = new MembershipPeriodDto();
            periodDto.dateDue = new Date();
            periodDto.statusCode = MembershipPeriodStatus.MarkedForCredit;
            headersDto = new HeadersDto();

            // @ts-ignore
            membershipService.getMembershipDetail.mockResolvedValue(membershipDto);
            // @ts-ignore
            membershipService.getMemberPersona.mockResolvedValue(persona);
        });

        describe('and non fabletics', () => {
            let expectedValue: MembershipDto;
            beforeEach(() => {
                expectedValue = new MembershipDto();
                expectedValue.adminFirstName = membershipDto.adminFirstName;
                expectedValue.persona = persona.personaName;
                expectedValue.personaTagId = persona.personaTagId;
            });

            describe('and period included true', () => {
                test('membership should return', async () => {
                    expectedValue.period = periodDto;
                    // @ts-ignore
                    membershipService.getMembershipPeriod.mockResolvedValue(periodDto);

                    const mc: MembershipController = new MembershipController(membershipService, cartService, memberService);

                    expect.assertions(4);

                    //act
                    const membership = await mc.getMembership(true, new StoreDetailDto(), headersDto);

                    //assert
                    expect(membership).toEqual(expectedValue);
                    expect(membershipService.getMembershipPeriod).toBeCalledWith(headersDto);
                    expect(membershipService.getMembershipDetail).toBeCalledWith(headersDto);
                    expect(membershipService.getMemberPersona).toBeCalledWith(headersDto);
                });
            });

            describe('and period included false', () => {
                test('membership should return', async () => {
                    // @ts-ignore
                    membershipService.getMembershipPeriod.mockRejectedValue(new Error('should not go here'));

                    const mc: MembershipController = new MembershipController(membershipService, cartService, memberService);

                    expect.assertions(6);

                    //act
                    const membership = await mc.getMembership(false, new StoreDetailDto(), headersDto);

                    //assert
                    expect(membership).toEqual(expectedValue);
                    expect(membershipService.getMembershipPeriod).not.toBeCalled();
                    expect(membershipService.getMembershipDetail).toBeCalledWith(headersDto);
                    expect(membershipService.getMemberPersona).toBeCalledWith(headersDto);
                    expect(memberService.getOnSiteMembershipExperienceDetail).not.toBeCalled();
                    expect(memberService.getMemberNmpDetails).not.toBeCalled();
                });
            });
        });

        describe('and fabletics', () => {
            let expectedValue: MembershipDto;
            let customerDetailDto: CustomerDetailDto;
            let nmpDetailsDto: CustomerNmpDetailsDto;
            let storeDetailDto: StoreDetailDto;

            beforeEach(() => {
                storeDetailDto = new StoreDetailDto();
                // @ts-ignore
                storeDetailDto.getBrandType.mockReturnValue(BrandType.Fabletics);

                customerDetailDto = new CustomerDetailDto();
                customerDetailDto.name = 'retail_postreg_start';
                customerDetailDto.datetimeAdded = new Date();

                nmpDetailsDto = new CustomerNmpDetailsDto();
                nmpDetailsDto.mobileAppAccessNotPermitted = true;
                nmpDetailsDto.nmpTestGroup = 3;

                expectedValue = new MembershipDto();
                expectedValue.adminFirstName = membershipDto.adminFirstName;
                expectedValue.persona = persona.personaName;
                expectedValue.personaTagId = persona.personaTagId;
                expectedValue.onSiteMembershipExperience = customerDetailDto.datetimeAdded;
                expectedValue.mobileAppAccessNotPermitted = nmpDetailsDto.mobileAppAccessNotPermitted;
                expectedValue.nmpTestGroup = nmpDetailsDto.nmpTestGroup;

                // @ts-ignore
                memberService.getOnSiteMembershipExperienceDetail.mockResolvedValue(customerDetailDto);
                // @ts-ignore
                memberService.getMemberNmpDetails.mockResolvedValue(nmpDetailsDto);
            });

            describe('and period included true', () => {
                test('membership should return', async () => {
                    expectedValue.period = periodDto;

                    // @ts-ignore
                    membershipService.getMembershipPeriod.mockResolvedValue(periodDto);

                    const mc: MembershipController = new MembershipController(membershipService, cartService, memberService);

                    expect.assertions(6);

                    //act
                    const membership = await mc.getMembership(true, storeDetailDto, headersDto);

                    //assert
                    expect(membership).toEqual(expectedValue);
                    expect(membershipService.getMembershipPeriod).toBeCalledWith(headersDto);
                    expect(membershipService.getMembershipDetail).toBeCalledWith(headersDto);
                    expect(membershipService.getMemberPersona).toBeCalledWith(headersDto);
                    expect(memberService.getOnSiteMembershipExperienceDetail).toBeCalledWith(headersDto);
                    expect(memberService.getMemberNmpDetails).toBeCalledWith(headersDto);
                });
            });

            describe('and period included false', () => {
                test('membership should return', async () => {
                    // @ts-ignore
                    membershipService.getMembershipPeriod.mockRejectedValue(new Error('should not go here'));

                    const mc: MembershipController = new MembershipController(membershipService, cartService, memberService);

                    expect.assertions(6);

                    //act
                    const membership = await mc.getMembership(false, storeDetailDto, headersDto);

                    //assert
                    expect(membership).toEqual(expectedValue);
                    expect(membershipService.getMembershipPeriod).not.toBeCalled();
                    expect(membershipService.getMembershipDetail).toBeCalledWith(headersDto);
                    expect(membershipService.getMemberPersona).toBeCalledWith(headersDto);
                    expect(memberService.getOnSiteMembershipExperienceDetail).toBeCalledWith(headersDto);
                    expect(memberService.getMemberNmpDetails).toBeCalledWith(headersDto);
                });
            });
        });
    });
});
