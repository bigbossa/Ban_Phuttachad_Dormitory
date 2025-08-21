import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserCreateDialog } from "./UserCreateDialog";
import { useAuth } from "@/providers/AuthProvider";

// Mock useAuth hook
jest.mock("@/providers/AuthProvider");
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Supabase client
jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [] })),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({ data: { id: "test-tenant-id" } })
          ),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      functions: {
        invoke: jest.fn(() =>
          Promise.resolve({
            user: { id: "test-user-id" },
            error: null,
          })
        ),
      },
    })),
  },
}));

// Mock html2canvas and jsPDF
jest.mock("html2canvas");
jest.mock("jspdf");

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ status: 200 }),
  } as Response)
);

describe("UserCreateDialog", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseAuth.mockReturnValue({
      session: { access_token: "test-token" },
      user: { role: "admin" },
      signOut: jest.fn(),
      signIn: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders user creation form", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UserCreateDialog
          open={true}
          onOpenChange={jest.fn()}
          price={5000}
          startDate="2024-01-01"
          endDate="2024-12-31"
        />
      </QueryClientProvider>
    );

    expect(screen.getByText("สร้างบัญชีผู้ใช้ใหม่")).toBeInTheDocument();
    expect(screen.getByLabelText("ชื่อ")).toBeInTheDocument();
    expect(screen.getByLabelText("นามสกุล")).toBeInTheDocument();
    expect(screen.getByLabelText("อีเมล")).toBeInTheDocument();
    expect(
      screen.getByLabelText("รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)")
    ).toBeInTheDocument();
  });

  it("shows room selection with available rooms only", async () => {
    // Mock available rooms data
    const mockAvailableRooms = [
      {
        id: "room-1",
        room_number: "101",
        room_type: "Standard Single",
        floor: 1,
        capacity: 2,
        current_occupants: 0,
        price: 5000,
        status: "vacant",
      },
      {
        id: "room-2",
        room_number: "102",
        room_type: "Standard Double",
        floor: 1,
        capacity: 2,
        current_occupants: 1,
        price: 6000,
        status: "occupied",
      },
    ];

    // Mock the query to return available rooms
    queryClient.setQueryData(
      ["available-rooms-with-capacity"],
      mockAvailableRooms
    );

    render(
      <QueryClientProvider client={queryClient}>
        <UserCreateDialog
          open={true}
          onOpenChange={jest.fn()}
          price={5000}
          startDate="2024-01-01"
          endDate="2024-12-31"
        />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText("เลือกห้องว่าง (ไม่มีคนเช่า)")
      ).toBeInTheDocument();
    });

    // Check that only vacant rooms are shown
    expect(
      screen.getByText("ห้อง 101 - Standard Single (ชั้น 1)")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("ห้อง 102 - Standard Double (ชั้น 1)")
    ).not.toBeInTheDocument();
  });

  it("shows no available rooms message when no vacant rooms", async () => {
    // Mock empty available rooms
    queryClient.setQueryData(["available-rooms-with-capacity"], []);

    render(
      <QueryClientProvider client={queryClient}>
        <UserCreateDialog
          open={true}
          onOpenChange={jest.fn()}
          price={5000}
          startDate="2024-01-01"
          endDate="2024-12-31"
        />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText("ไม่มีห้องว่างที่ไม่มีคนเช่า")
      ).toBeInTheDocument();
    });
  });

  it("validates required fields before submission", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UserCreateDialog
          open={true}
          onOpenChange={jest.fn()}
          price={5000}
          startDate="2024-01-01"
          endDate="2024-12-31"
        />
      </QueryClientProvider>
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByText("ถัดไป");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("กรุณาใส่ชื่อ")).toBeInTheDocument();
      expect(screen.getByText("กรุณาใส่นามสกุล")).toBeInTheDocument();
      expect(screen.getByText("กรุณาใส่อีเมลที่ถูกต้อง")).toBeInTheDocument();
      expect(
        screen.getByText("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      ).toBeInTheDocument();
    });
  });

  it("shows room status badge correctly", async () => {
    const mockAvailableRooms = [
      {
        id: "room-1",
        room_number: "101",
        room_type: "Standard Single",
        floor: 1,
        capacity: 2,
        current_occupants: 0,
        price: 5000,
        status: "vacant",
      },
    ];

    queryClient.setQueryData(
      ["available-rooms-with-capacity"],
      mockAvailableRooms
    );

    render(
      <QueryClientProvider client={queryClient}>
        <UserCreateDialog
          open={true}
          onOpenChange={jest.fn()}
          price={5000}
          startDate="2024-01-01"
          endDate="2024-12-31"
        />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("ว่าง")).toBeInTheDocument();
      expect(screen.getByText("5,000 บาท/เดือน")).toBeInTheDocument();
    });
  });

  it("filters rooms to show only completely vacant ones", async () => {
    const mockRooms = [
      {
        id: "room-1",
        room_number: "101",
        room_type: "Standard Single",
        floor: 1,
        capacity: 2,
        current_occupants: 0,
        price: 5000,
        status: "vacant",
      },
      {
        id: "room-2",
        room_number: "102",
        room_type: "Standard Double",
        floor: 1,
        capacity: 2,
        current_occupants: 0,
        price: 6000,
        status: "vacant",
      },
      {
        id: "room-3",
        room_number: "103",
        room_type: "Standard Single",
        floor: 1,
        capacity: 2,
        current_occupants: 1,
        price: 5000,
        status: "occupied",
      },
    ];

    queryClient.setQueryData(["available-rooms-with-capacity"], mockRooms);

    render(
      <QueryClientProvider client={queryClient}>
        <UserCreateDialog
          open={true}
          onOpenChange={jest.fn()}
          price={5000}
          startDate="2024-01-01"
          endDate="2024-12-31"
        />
      </QueryClientProvider>
    );

    await waitFor(() => {
      // Should show only rooms with 0 occupants
      expect(
        screen.getByText("ห้อง 101 - Standard Single (ชั้น 1)")
      ).toBeInTheDocument();
      expect(
        screen.getByText("ห้อง 102 - Standard Double (ชั้น 1)")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("ห้อง 103 - Standard Single (ชั้น 1)")
      ).not.toBeInTheDocument();
    });
  });
});
