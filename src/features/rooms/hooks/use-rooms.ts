import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRoom,
  deleteRoom,
  getRoom,
  getRooms,
  getRoomsSummary,
  type RoomFilters,
  type RoomInput,
  type RoomStatus,
  updateRoom,
  updateRoomStatus,
} from '@/features/rooms/api/rooms-api'

export const roomsQueryKey = ['rooms'] as const

export function useRooms(filters: RoomFilters) {
  return useQuery({
    queryKey: [...roomsQueryKey, filters],
    queryFn: ({ signal }) => getRooms(filters, signal),
  })
}

export function useRoomsSummary() {
  return useQuery({
    queryKey: [...roomsQueryKey, 'summary'],
    queryFn: ({ signal }) => getRoomsSummary(signal),
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: [...roomsQueryKey, 'detail', id],
    queryFn: ({ signal }) => getRoom(id, signal),
    enabled: Boolean(id),
  })
}

function useInvalidateRooms() {
  const queryClient = useQueryClient()

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: roomsQueryKey }),
      queryClient.invalidateQueries({ queryKey: ['study-groups'] }),
    ])
  }
}

export function useCreateRoom() {
  const invalidate = useInvalidateRooms()
  return useMutation({ mutationFn: createRoom, onSuccess: invalidate })
}

export function useUpdateRoom() {
  const invalidate = useInvalidateRooms()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoomInput }) =>
      updateRoom(id, input),
    onSuccess: invalidate,
  })
}

export function useUpdateRoomStatus() {
  const invalidate = useInvalidateRooms()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RoomStatus }) =>
      updateRoomStatus(id, status),
    onSuccess: invalidate,
  })
}

export function useDeleteRoom() {
  const invalidate = useInvalidateRooms()
  return useMutation({ mutationFn: deleteRoom, onSuccess: invalidate })
}
