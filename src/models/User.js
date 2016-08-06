export const User = () {
	return {
		email: {
			type: 'varchar',
			label: 'E-mail address',
			validation: {
				maxLength: 60,
				regex: /.+@.+\..+/i
			}
		},
		password: {
			type: 'varchar',
			label: 'Password',
			validation: {
				minLength: 7,
				maxLength: 160
			},
			dbValidation: {
				maxLength: 500
			}
		},
		salt: {
			type: 'varchar',
			validation: {
				maxLength: 200
			}
		},
		passwordSchema: {
			type: 'smallint'
		},
		registrationIp: {
			type: 'inet'
		},
		isVerified: {
			type: 'boolean'
		},
		lastLogin: {
			type: 'timestamp'
		}
	};
};
