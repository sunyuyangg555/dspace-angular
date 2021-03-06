import { cold, getTestScheduler } from 'jasmine-marbles';
import { TestScheduler } from 'rxjs/testing';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { FindByIDRequest } from './request.models';
import { RequestService } from './request.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationDataService } from './configuration-data.service';
import { ConfigurationProperty } from '../shared/configuration-property.model';

describe('ConfigurationDataService', () => {
  let scheduler: TestScheduler;
  let service: ConfigurationDataService;
  let halService: HALEndpointService;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  const testObject = {
    uuid: 'test-property',
    name: 'test-property',
    values: ['value-1', 'value-2']
  } as ConfigurationProperty;
  const configLink = 'https://rest.api/rest/api/config/properties';
  const requestURL = `https://rest.api/rest/api/config/properties/${testObject.name}`;
  const requestUUID = 'test-property';

  beforeEach(() => {
    scheduler = getTestScheduler();

    halService = jasmine.createSpyObj('halService', {
      getEndpoint: cold('a', {a: configLink})
    });
    requestService = jasmine.createSpyObj('requestService', {
      generateRequestId: requestUUID,
      configure: true
    });
    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: cold('a', {
        a: {
          payload: testObject
        }
      })
    });
    objectCache = {} as ObjectCacheService;
    const notificationsService = {} as NotificationsService;
    const http = {} as HttpClient;
    const comparator = {} as any;

    service = new ConfigurationDataService(
      requestService,
      rdbService,
      objectCache,
      halService,
      notificationsService,
      http,
      comparator
    );
  });

  describe('findById', () => {
    it('should call HALEndpointService with the path to the properties endpoint', () => {
      scheduler.schedule(() => service.findByPropertyName(testObject.name));
      scheduler.flush();

      expect(halService.getEndpoint).toHaveBeenCalledWith('properties');
    });

    it('should configure the proper FindByIDRequest', () => {
      scheduler.schedule(() => service.findByPropertyName(testObject.name));
      scheduler.flush();

      expect(requestService.configure).toHaveBeenCalledWith(new FindByIDRequest(requestUUID, requestURL, testObject.name));
    });

    it('should return a RemoteData<ConfigurationProperty> for the object with the given name', () => {
      const result = service.findByPropertyName(testObject.name);
      const expected = cold('a', {
        a: {
          payload: testObject
        }
      });
      expect(result).toBeObservable(expected);
    });
  });
});
