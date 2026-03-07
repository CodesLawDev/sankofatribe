import { findOrCreateCustomer } from '../customer-service'

// ---------------------------------------------------------------------------
// Mock dependencies
// ---------------------------------------------------------------------------

const mockFindUnique = jest.fn()
const mockCreate = jest.fn()
const mockAddressCreate = jest.fn()

jest.mock('../auth-utils', () => ({
  getPrisma: jest.fn(() => ({
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
    address: {
      create: mockAddressCreate,
    },
  })),
  hashPassword: jest.fn().mockResolvedValue('hashed_random_password'),
}))

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: () => 'mocked_random_hex',
  })),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseCustomer = {
  email: 'test@example.com',
  firstName: 'Kofi',
  lastName: 'Asante',
  phone: '+233201234567',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('findOrCreateCustomer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── Existing customer ────────────────────────────────────────────────────

  describe('when the customer already exists', () => {
    const existingUser = {
      id: 'user-existing',
      email: 'test@example.com',
      firstName: 'Kofi',
      lastName: 'Asante',
    }

    beforeEach(() => {
      mockFindUnique.mockResolvedValue(existingUser)
    })

    it('returns the existing user', async () => {
      const result = await findOrCreateCustomer(baseCustomer)
      expect(result.user).toEqual(existingUser)
    })

    it('sets created to false', async () => {
      const result = await findOrCreateCustomer(baseCustomer)
      expect(result.created).toBe(false)
    })

    it('does not create a new user record', async () => {
      await findOrCreateCustomer(baseCustomer)
      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  // ── New customer ─────────────────────────────────────────────────────────

  describe('when the customer does not exist', () => {
    const newUser = {
      id: 'user-new',
      email: 'new@example.com',
      firstName: 'Ama',
      lastName: 'Mensah',
    }

    beforeEach(() => {
      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue(newUser)
      mockAddressCreate.mockResolvedValue({})
    })

    it('creates a new user record', async () => {
      await findOrCreateCustomer({ ...baseCustomer, email: 'new@example.com', firstName: 'Ama', lastName: 'Mensah' })
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })

    it('sets created to true', async () => {
      const result = await findOrCreateCustomer({ ...baseCustomer, email: 'new@example.com', firstName: 'Ama', lastName: 'Mensah' })
      expect(result.created).toBe(true)
    })

    it('returns the newly created user', async () => {
      const result = await findOrCreateCustomer({ ...baseCustomer, email: 'new@example.com', firstName: 'Ama', lastName: 'Mensah' })
      expect(result.user).toEqual(newUser)
    })

    it('assigns a hashed random password (not a known value)', async () => {
      await findOrCreateCustomer({ ...baseCustomer, email: 'new@example.com', firstName: 'Ama', lastName: 'Mensah' })
      const callArg = mockCreate.mock.calls[0][0]
      expect(callArg.data.passwordHash).toBe('hashed_random_password')
    })

    it('sets role to CUSTOMER and status to ACTIVE', async () => {
      await findOrCreateCustomer({ ...baseCustomer, email: 'new@example.com', firstName: 'Ama', lastName: 'Mensah' })
      const callArg = mockCreate.mock.calls[0][0]
      expect(callArg.data.role).toBe('CUSTOMER')
      expect(callArg.data.status).toBe('ACTIVE')
    })
  })

  // ── Idempotency (email normalisation) ───────────────────────────────────

  describe('idempotency', () => {
    it('normalises email to lowercase before lookup', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-x',
        email: 'test@example.com',
        firstName: 'Kofi',
        lastName: 'Asante',
      })

      await findOrCreateCustomer({ ...baseCustomer, email: 'TEST@EXAMPLE.COM' })

      expect(mockFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'test@example.com' } })
      )
    })

    it('stores email in lowercase when creating', async () => {
      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue({
        id: 'user-y',
        email: 'mixed@example.com',
        firstName: 'Ama',
        lastName: 'Mensah',
      })

      await findOrCreateCustomer({ ...baseCustomer, email: 'Mixed@Example.COM', firstName: 'Ama', lastName: 'Mensah' })

      const callArg = mockCreate.mock.calls[0][0]
      expect(callArg.data.email).toBe('mixed@example.com')
    })
  })

  // ── Address creation ─────────────────────────────────────────────────────

  describe('address handling', () => {
    const newUser = { id: 'user-addr', email: 'addr@example.com', firstName: 'Yaw', lastName: 'Boateng' }

    beforeEach(() => {
      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue(newUser)
      mockAddressCreate.mockResolvedValue({})
    })

    it('creates an address when city is provided', async () => {
      await findOrCreateCustomer({
        email: 'addr@example.com',
        firstName: 'Yaw',
        lastName: 'Boateng',
        address: { city: 'Accra', country: 'Ghana' },
      })

      expect(mockAddressCreate).toHaveBeenCalledTimes(1)
      const addressArg = mockAddressCreate.mock.calls[0][0]
      expect(addressArg.data.city).toBe('Accra')
      expect(addressArg.data.userId).toBe(newUser.id)
      expect(addressArg.data.isDefault).toBe(true)
    })

    it('creates an address when street is provided', async () => {
      await findOrCreateCustomer({
        email: 'addr@example.com',
        firstName: 'Yaw',
        lastName: 'Boateng',
        address: { street: '5 Ring Road', city: 'Kumasi' },
      })

      expect(mockAddressCreate).toHaveBeenCalledTimes(1)
    })

    it('does not create an address when none is provided', async () => {
      await findOrCreateCustomer({
        email: 'addr@example.com',
        firstName: 'Yaw',
        lastName: 'Boateng',
      })

      expect(mockAddressCreate).not.toHaveBeenCalled()
    })

    it('does not fail if address creation throws', async () => {
      mockAddressCreate.mockRejectedValue(new Error('DB constraint'))

      await expect(
        findOrCreateCustomer({
          email: 'addr@example.com',
          firstName: 'Yaw',
          lastName: 'Boateng',
          address: { city: 'Takoradi' },
        })
      ).resolves.toBeDefined()
    })

    it('does not create an address for an already existing customer', async () => {
      mockFindUnique.mockResolvedValue(newUser)

      await findOrCreateCustomer({
        email: 'addr@example.com',
        firstName: 'Yaw',
        lastName: 'Boateng',
        address: { city: 'Accra' },
      })

      expect(mockAddressCreate).not.toHaveBeenCalled()
    })
  })

  // ── Audit logging ─────────────────────────────────────────────────────────

  describe('audit logging', () => {
    it('logs a customer_created event when a new customer is created', async () => {
      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue({
        id: 'user-log',
        email: 'log@example.com',
        firstName: 'Abena',
        lastName: 'Osei',
      })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await findOrCreateCustomer({ email: 'log@example.com', firstName: 'Abena', lastName: 'Osei' })

      const loggedPayload = JSON.parse(consoleSpy.mock.calls[0][0])
      expect(loggedPayload.event).toBe('customer_created')
      expect(loggedPayload.email).toBe('log@example.com')
      expect(loggedPayload.trigger).toBe('purchase_attempt')
      expect(loggedPayload.userId).toBe('user-log')
      expect(loggedPayload.timestamp).toBeDefined()

      consoleSpy.mockRestore()
    })

    it('does not emit a customer_created event for existing customers', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-existing',
        email: 'test@example.com',
        firstName: 'Kofi',
        lastName: 'Asante',
      })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await findOrCreateCustomer(baseCustomer)

      const logCalls = consoleSpy.mock.calls.filter((args) => {
        try {
          return JSON.parse(args[0])?.event === 'customer_created'
        } catch {
          return false
        }
      })
      expect(logCalls).toHaveLength(0)

      consoleSpy.mockRestore()
    })
  })
})
