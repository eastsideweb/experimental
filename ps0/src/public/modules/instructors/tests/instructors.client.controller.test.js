'use strict';

(function() {
	// Instructors Controller Spec
	describe('Instructors Controller Tests', function() {
		// Initialize global variables
		var InstructorsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Instructors controller.
			InstructorsController = $controller('InstructorsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Instructor object fetched from XHR', inject(function(Instructors) {
			// Create sample Instructor using the Instructors service
			var sampleInstructor = new Instructors({
				name: 'New Instructor'
			});

			// Create a sample Instructors array that includes the new Instructor
			var sampleInstructors = [sampleInstructor];

			// Set GET response
			$httpBackend.expectGET('instructors').respond(sampleInstructors);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.instructors).toEqualData(sampleInstructors);
		}));

		it('$scope.findOne() should create an array with one Instructor object fetched from XHR using a instructorId URL parameter', inject(function(Instructors) {
			// Define a sample Instructor object
			var sampleInstructor = new Instructors({
				name: 'New Instructor'
			});

			// Set the URL parameter
			$stateParams.instructorId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/instructors\/([0-9a-fA-F]{24})$/).respond(sampleInstructor);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.instructor).toEqualData(sampleInstructor);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Instructors) {
			// Create a sample Instructor object
			var sampleInstructorPostData = new Instructors({
				name: 'New Instructor'
			});

			// Create a sample Instructor response
			var sampleInstructorResponse = new Instructors({
				_id: '525cf20451979dea2c000001',
				name: 'New Instructor'
			});

			// Fixture mock form input values
			scope.name = 'New Instructor';

			// Set POST response
			$httpBackend.expectPOST('instructors', sampleInstructorPostData).respond(sampleInstructorResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Instructor was created
			expect($location.path()).toBe('/instructors/' + sampleInstructorResponse._id);
		}));

		it('$scope.update() should update a valid Instructor', inject(function(Instructors) {
			// Define a sample Instructor put data
			var sampleInstructorPutData = new Instructors({
				_id: '525cf20451979dea2c000001',
				name: 'New Instructor'
			});

			// Mock Instructor in scope
			scope.instructor = sampleInstructorPutData;

			// Set PUT response
			$httpBackend.expectPUT(/instructors\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/instructors/' + sampleInstructorPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid instructorId and remove the Instructor from the scope', inject(function(Instructors) {
			// Create new Instructor object
			var sampleInstructor = new Instructors({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Instructors array and include the Instructor
			scope.instructors = [sampleInstructor];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/instructors\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleInstructor);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.instructors.length).toBe(0);
		}));
	});
}());